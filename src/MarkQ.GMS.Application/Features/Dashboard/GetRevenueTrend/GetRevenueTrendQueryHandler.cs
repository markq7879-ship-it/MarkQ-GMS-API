using MarkQ.GMS.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Dashboard.GetRevenueTrend;

public class GetRevenueTrendQueryHandler : IRequestHandler<GetRevenueTrendQuery, RevenueTrendDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public GetRevenueTrendQueryHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<RevenueTrendDto> Handle(GetRevenueTrendQuery r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);
        var now = _clock.UtcNow;
        var months = Math.Clamp(r.Months, 1, 24);

        var startDate = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc)
            .AddMonths(-(months - 1));

        var paymentsQuery = _db.Payments
            .Where(p => p.OrganizationId == me.OrganizationId
                     && p.Status == "COMPLETED"
                     && p.PaidAt >= startDate);

        if (!_currentUser.IsOwner)
        {
            var allowed = _currentUser.BranchIds.ToArray();
            paymentsQuery = paymentsQuery.Where(p => allowed.Contains(p.BranchId));
        }

        var revenueByMonth = await paymentsQuery
            .GroupBy(p => new { p.PaidAt.Year, p.PaidAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Revenue = g.Sum(p => p.Amount) })
            .ToListAsync(ct);

        var points = new List<RevenueTrendPointDto>();
        for (int i = 0; i < months; i++)
        {
            var d = startDate.AddMonths(i);
            var rev = revenueByMonth
                .FirstOrDefault(x => x.Year == d.Year && x.Month == d.Month)?.Revenue ?? 0m;

            points.Add(new RevenueTrendPointDto(
                d.ToString("MMM", System.Globalization.CultureInfo.InvariantCulture),
                d.Year,
                d.Month,
                rev));
        }

        decimal mom = 0m;
        if (points.Count >= 2)
        {
            var prev = points[^2].Revenue;
            var curr = points[^1].Revenue;
            if (prev > 0)
                mom = Math.Round((curr - prev) / prev * 100m, 1);
            else if (curr > 0)
                mom = 100m;
        }

        return new RevenueTrendDto(points, mom, points.Sum(p => p.Revenue), now);
    }
}
