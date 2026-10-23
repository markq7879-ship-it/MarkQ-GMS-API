using MarkQ.GMS.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Dashboard.GetDashboardStats;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public GetDashboardStatsQueryHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);
        var now = _clock.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var sevenDaysFromNow = today.AddDays(7);
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var dayStart = now.Date;

        var membersQuery = _db.Members.Where(m => m.OrganizationId == me.OrganizationId);
        if (!_currentUser.IsOwner)
        {
            var allowed = _currentUser.BranchIds.ToArray();
            membersQuery = membersQuery.Where(m => allowed.Contains(m.BranchId));
        }
        var totalMembers = await membersQuery.CountAsync(ct);
        var newMembersToday = await membersQuery
            .CountAsync(m => m.CreatedAt >= dayStart && m.CreatedAt < dayStart.AddDays(1), ct);
        var newMembersThisMonth = await membersQuery.CountAsync(m => m.CreatedAt >= monthStart, ct);
        var memberIds = await membersQuery.Select(m => m.Id).ToListAsync(ct);

        var membershipsQuery = _db.Memberships
            .Where(x => memberIds.Contains(x.MemberId) && x.CancelledAt == null);

        var activeMemberIds = await membershipsQuery
            .Where(x => x.EndDate >= today).Select(x => x.MemberId).Distinct().ToListAsync(ct);

        var expiringTodayIds = await membershipsQuery
            .Where(x => x.EndDate == today).Select(x => x.MemberId).Distinct().ToListAsync(ct);

        // Expiring in next 7 days (excludes today)
        var expiring7Ids = await membershipsQuery
            .Where(x => x.EndDate > today && x.EndDate <= sevenDaysFromNow)
            .Select(x => x.MemberId).Distinct().ToListAsync(ct);

        var inactive = totalMembers - activeMemberIds.Count;
        if (inactive < 0) inactive = 0;

        var branchesQuery = _db.Branches.Where(b => b.OrganizationId == me.OrganizationId);
        if (!_currentUser.IsOwner)
        {
            var allowed = _currentUser.BranchIds.ToArray();
            branchesQuery = branchesQuery.Where(b => allowed.Contains(b.Id));
        }
        var activeBranches = await branchesQuery.CountAsync(b => b.IsActive, ct);

        var paymentsQuery = _db.Payments
            .Where(p => p.OrganizationId == me.OrganizationId && p.Status == "COMPLETED");
        if (!_currentUser.IsOwner)
        {
            var allowed = _currentUser.BranchIds.ToArray();
            paymentsQuery = paymentsQuery.Where(p => allowed.Contains(p.BranchId));
        }

        var todayRevenue = await paymentsQuery
            .Where(p => p.PaidAt >= dayStart && p.PaidAt < dayStart.AddDays(1))
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        var monthlyRevenue = await paymentsQuery
            .Where(p => p.PaidAt >= monthStart)
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        var activeMemberships = await membershipsQuery
            .Where(x => x.EndDate >= today)
            .Select(x => new { x.Id, x.TotalPayable })
            .ToListAsync(ct);

        var activeMembIds = activeMemberships.Select(x => x.Id).ToList();
        var paidPerMembership = await _db.Payments
            .Where(p => activeMembIds.Contains(p.MembershipId) && p.Status == "COMPLETED")
            .GroupBy(p => p.MembershipId)
            .Select(g => new { MembershipId = g.Key, Total = g.Sum(p => p.Amount) })
            .ToDictionaryAsync(x => x.MembershipId, x => x.Total, ct);

        var totalPending = activeMemberships
            .Sum(m => Math.Max(0, m.TotalPayable - paidPerMembership.GetValueOrDefault(m.Id, 0m)));

        var pendingCount = activeMemberships
            .Count(m => m.TotalPayable - paidPerMembership.GetValueOrDefault(m.Id, 0m) > 0);

        return new DashboardStatsDto(
            totalMembers,
            activeMemberIds.Count,
            expiringTodayIds.Count,
            expiring7Ids.Count,
            inactive,
            activeBranches,
            newMembersToday,
            newMembersThisMonth,
            pendingCount,
            todayRevenue,
            monthlyRevenue,
            totalPending,
            RevenueAvailable: true,
            PendingAvailable: true,
            AttendanceAvailable: false,
            PresentToday: 0,
            now);
    }
}
