using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MarkQ.GMS.Application.Features.Users.GetUsers;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Users.UpdateUser;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserSummaryDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateUserCommandHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<UserSummaryDto> Handle(UpdateUserCommand request, CancellationToken ct)
    {
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can update users.");

        var user = await _db.Users.Include(u => u.BranchAssignments)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, ct)
            ?? throw new NotFoundException("User not found.");

        if (user.Id == _currentUser.UserId && user.Role != request.Role)
            throw new ForbiddenException("You cannot change your own role.");

        user.FullName = request.FullName.Trim();
        user.Phone = request.Phone?.Trim();
        user.Role = request.Role;
        await _db.SaveChangesAsync(ct);

        return new UserSummaryDto(
            user.Id, user.Email, user.FullName, user.Phone, user.Role, user.IsActive, user.LastLoginAt,
            user.BranchAssignments.Select(ub => ub.BranchId).ToArray());
    }
}
