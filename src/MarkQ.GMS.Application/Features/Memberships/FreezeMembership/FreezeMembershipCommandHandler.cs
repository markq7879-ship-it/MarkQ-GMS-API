using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Memberships.FreezeMembership;

public class FreezeMembershipCommandHandler : IRequestHandler<FreezeMembershipCommand, MembershipDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public FreezeMembershipCommandHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<MembershipDto> Handle(FreezeMembershipCommand r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);
        var m = await _db.Memberships
            .Include(x => x.Member).Include(x => x.Plan)
            .FirstOrDefaultAsync(x => x.Id == r.Id && x.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Membership not found.");

        if (m.CancelledAt.HasValue)
            throw new ConflictException("Cancelled memberships cannot be frozen.");

        if (m.Plan!.FreezeEligible == false)
            throw new ConflictException("This plan is not freeze-eligible.");

        var days = r.FreezeTo.DayNumber - r.FreezeFrom.DayNumber + 1;
        if (days <= 0) throw new ConflictException("Invalid freeze range.");
        if (days > m.Plan.MaxFreezeDays)
            throw new ConflictException($"Freeze exceeds the plan maximum of {m.Plan.MaxFreezeDays} days.");

        m.FrozenFrom = r.FreezeFrom;
        m.FrozenTo = r.FreezeTo;
        m.FreezeReason = r.Reason.Trim();
        m.EndDate = m.EndDate.AddDays(days);

        await _db.SaveChangesAsync(ct);

        var paid = await _db.Payments
            .Where(p => p.MembershipId == m.Id && p.Status == "COMPLETED")
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        var today = DateOnly.FromDateTime(_clock.UtcNow);
        return GetMemberships.GetMembershipsQueryHandler.ToDto(m, today, paid);
    }
}
