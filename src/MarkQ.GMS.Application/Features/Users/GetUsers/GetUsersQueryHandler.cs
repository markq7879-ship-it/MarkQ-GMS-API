using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Users.GetUsers;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, IReadOnlyCollection<UserSummaryDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetUsersQueryHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<IReadOnlyCollection<UserSummaryDto>> Handle(GetUsersQuery request, CancellationToken ct)
    {
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can list users.");

        var query = _db.Users.Include(u => u.BranchAssignments).AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLowerInvariant();
            query = query.Where(u => u.Email.ToLower().Contains(s) || u.FullName.ToLower().Contains(s));
        }

        var users = await query.OrderBy(u => u.FullName).ToListAsync(ct);

        return users.Select(u => new UserSummaryDto(
            u.Id, u.Email, u.FullName, u.Phone, u.Role, u.IsActive, u.LastLoginAt,
            u.BranchAssignments.Select(ub => ub.BranchId).ToArray()))
            .ToArray();
    }
}
