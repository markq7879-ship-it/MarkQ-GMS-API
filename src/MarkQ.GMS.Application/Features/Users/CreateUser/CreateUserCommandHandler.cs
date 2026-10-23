using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MarkQ.GMS.Application.Features.Auth.Login;
using MarkQ.GMS.Domain.Constants;
using MarkQ.GMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Users.CreateUser;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserInfoDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IPasswordHasher _hasher;

    public CreateUserCommandHandler(IAppDbContext db, ICurrentUserService cu, IPasswordHasher hasher)
    {
        _db = db; _currentUser = cu; _hasher = hasher;
    }

    public async Task<UserInfoDto> Handle(CreateUserCommand request, CancellationToken ct)
    {
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can create users.");

        var email = request.Email.Trim().ToLowerInvariant();

        if (await _db.Users.AnyAsync(u => u.Email == email, ct))
            throw new ConflictException("A user with email '" + email + "' already exists.");

        var owner = await _db.Users
            .FirstAsync(u => u.Id == _currentUser.UserId!.Value, ct);

        var user = new User
        {
            OrganizationId = owner.OrganizationId,
            Email = email,
            PasswordHash = _hasher.Hash(request.Password),
            FullName = request.FullName.Trim(),
            Phone = request.Phone?.Trim(),
            Role = request.Role,
            IsActive = true
        };

        if (request.Role == AppRoles.Admin && request.BranchIds.Count > 0)
        {
            var validBranchIds = await _db.Branches
                .Where(b => request.BranchIds.Contains(b.Id) && b.OrganizationId == user.OrganizationId)
                .Select(b => b.Id)
                .ToListAsync(ct);

            foreach (var branchId in validBranchIds)
                user.BranchAssignments.Add(new UserBranch { BranchId = branchId });
        }

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        var branchIds = user.BranchAssignments.Select(ub => ub.BranchId).ToArray();
        return new UserInfoDto(user.Id, user.Email, user.FullName, user.Role, branchIds);
    }
}
