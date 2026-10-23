using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Branches.ToggleBranchStatus;

public class ToggleBranchStatusCommandHandler : IRequestHandler<ToggleBranchStatusCommand, Unit>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ToggleBranchStatusCommandHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<Unit> Handle(ToggleBranchStatusCommand request, CancellationToken ct)
    {
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can change branch status.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId!.Value, ct);

        var branch = await _db.Branches
            .FirstOrDefaultAsync(b => b.Id == request.Id && b.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Branch not found.");

        branch.IsActive = request.IsActive;
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
