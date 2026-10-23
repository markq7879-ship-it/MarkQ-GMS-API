using MarkQ.GMS.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Memberships.GetMemberships;

public class GetMembershipsQueryHandler : IRequestHandler<GetMembershipsQuery, IReadOnlyCollection<MembershipDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public GetMembershipsQueryHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<IReadOnlyCollection<MembershipDto>> Handle(GetMembershipsQuery r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);
        var query = _db.Memberships
            .Include(x => x.Member)
            .Include(x => x.Plan)
            .Where(x => x.OrganizationId == me.OrganizationId);

        if (!_currentUser.IsOwner)
        {
            var allowed = _currentUser.BranchIds.ToArray();
            query = query.Where(x => allowed.Contains(x.Member!.BranchId));
        }

        if (r.MemberId.HasValue)
            query = query.Where(x => x.MemberId == r.MemberId.Value);

        if (!string.IsNullOrWhiteSpace(r.Search))
        {
            var s = r.Search.Trim().ToLower();
            query = query.Where(x =>
                x.Member!.FullName.ToLower().Contains(s) ||
                x.Member!.MemberCode.ToLower().Contains(s) ||
                x.MembershipNumber.ToLower().Contains(s));
        }

        var list = await query.OrderByDescending(x => x.StartDate).ToListAsync(ct);
        var ids = list.Select(x => x.Id).ToList();

        var totals = await _db.Payments
            .Where(p => ids.Contains(p.MembershipId) && p.Status == "COMPLETED")
            .GroupBy(p => p.MembershipId)
            .Select(g => new { MembershipId = g.Key, Total = g.Sum(p => p.Amount) })
            .ToDictionaryAsync(x => x.MembershipId, x => x.Total, ct);

        var today = DateOnly.FromDateTime(_clock.UtcNow);

        return list.Select(x => ToDto(x, today, totals.GetValueOrDefault(x.Id, 0m))).ToArray();
    }

    internal static MembershipDto ToDto(Domain.Entities.Membership x, DateOnly today, decimal totalPaid)
    {
        string status;
        if (x.CancelledAt.HasValue) status = "CANCELLED";
        else if (x.FrozenFrom.HasValue && x.FrozenTo.HasValue && today >= x.FrozenFrom.Value && today <= x.FrozenTo.Value) status = "FROZEN";
        else if (x.EndDate < today) status = "EXPIRED";
        else status = "ACTIVE";

        var balance = x.TotalPayable - totalPaid;
        var paymentStatus = MembershipPaymentStatus.Compute(x.TotalPayable, totalPaid);

        return new MembershipDto(
            x.Id, x.MembershipNumber,
            x.MemberId, x.Member?.MemberCode ?? "", x.Member?.FullName ?? "",
            x.PlanId, x.Plan?.Name ?? "",
            x.StartDate, x.EndDate, status,
            x.FrozenFrom, x.FrozenTo, x.FreezeReason,
            x.PaymentDueDate, x.Notes, x.DiscountReason,
            x.EndDateOverridden, x.EndDateOverrideReason,
            x.PriceAtPurchase, x.RegistrationFeeAtPurchase, x.DiscountAtPurchase,
            x.GstPercentAtPurchase, x.GstIncludedAtPurchase, x.TotalPayable,
            totalPaid, balance < 0 ? 0 : balance, paymentStatus);
    }
}

