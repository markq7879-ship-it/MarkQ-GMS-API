using MarkQ.GMS.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Branches.GetBranches;

public class GetBranchesQueryHandler : IRequestHandler<GetBranchesQuery, IReadOnlyCollection<BranchDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetBranchesQueryHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<IReadOnlyCollection<BranchDto>> Handle(GetBranchesQuery request, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);
        var query = _db.Branches.Where(b => b.OrganizationId == me.OrganizationId);

        if (!_currentUser.IsOwner)
        {
            var assignedIds = _currentUser.BranchIds.ToArray();
            query = query.Where(b => assignedIds.Contains(b.Id));
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            query = query.Where(b => b.Name.ToLower().Contains(s) || b.Code.ToLower().Contains(s));
        }

        var branches = await query.OrderBy(b => b.Code).ToListAsync(ct);
        return branches.Select(b => new BranchDto(b.Id, b.Code, b.Name, b.IsActive, b.CreatedAt)).ToArray();
    }
}
