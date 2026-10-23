using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Memberships.CancelMembership;

public class CancelMembershipCommandHandler : IRequestHandler<CancelMembershipCommand, Unit>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public CancelMembershipCommandHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<Unit> Handle(CancelMembershipCommand r, CancellationToken ct)
    {
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can cancel memberships.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId!.Value, ct);
        var m = await _db.Memberships
            .FirstOrDefaultAsync(x => x.Id == r.Id && x.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Membership not found.");

        if (m.CancelledAt.HasValue)
            throw new ConflictException("Membership is already cancelled.");

        m.CancelledAt = _clock.UtcNow;
        m.CancelReason = r.Reason.Trim();
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
