using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MarkQ.GMS.Application.Features.Auth.Login;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Auth.Me;

public class GetMeQueryHandler : IRequestHandler<GetMeQuery, UserInfoDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetMeQueryHandler(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db; _currentUser = currentUser;
    }

    public async Task<UserInfoDto> Handle(GetMeQuery request, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var user = await _db.Users
            .Include(u => u.BranchAssignments)
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value, ct)
            ?? throw new NotFoundException("User not found.");

        var branchIds = user.BranchAssignments.Select(ub => ub.BranchId).ToArray();
        return new UserInfoDto(user.Id, user.Email, user.FullName, user.Role, branchIds);
    }
}
