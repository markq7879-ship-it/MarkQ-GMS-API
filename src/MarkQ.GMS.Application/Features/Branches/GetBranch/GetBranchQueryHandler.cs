using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Branches.GetBranch;

public class GetBranchQueryHandler : IRequestHandler<GetBranchQuery, BranchDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetBranchQueryHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<BranchDto> Handle(GetBranchQuery request, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var branch = await _db.Branches
            .FirstOrDefaultAsync(b => b.Id == request.Id && b.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Branch not found.");

        if (!_currentUser.IsOwner && !_currentUser.BranchIds.Contains(branch.Id))
            throw new ForbiddenException("You do not have access to this branch.");

        return new BranchDto(branch.Id, branch.Code, branch.Name, branch.IsActive, branch.CreatedAt);
    }
}
