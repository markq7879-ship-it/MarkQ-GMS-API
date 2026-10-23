using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.MembershipPlans.TogglePlanStatus;

public class TogglePlanStatusCommandHandler : IRequestHandler<TogglePlanStatusCommand, Unit>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public TogglePlanStatusCommandHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<Unit> Handle(TogglePlanStatusCommand r, CancellationToken ct)
    {
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can change plan status.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId!.Value, ct);

        var plan = await _db.MembershipPlans
            .FirstOrDefaultAsync(p => p.Id == r.Id && p.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Membership plan not found.");

        plan.IsActive = r.IsActive;
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
