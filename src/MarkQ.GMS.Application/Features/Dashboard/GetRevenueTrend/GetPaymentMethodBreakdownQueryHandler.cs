using MarkQ.GMS.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Dashboard.GetRevenueTrend;

public class GetPaymentMethodBreakdownQueryHandler
    : IRequestHandler<GetPaymentMethodBreakdownQuery, PaymentMethodBreakdownResponse>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetPaymentMethodBreakdownQueryHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<PaymentMethodBreakdownResponse> Handle(
        GetPaymentMethodBreakdownQuery r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var q = _db.Payments
            .Where(p => p.OrganizationId == me.OrganizationId && p.Status == "COMPLETED");

        if (!_currentUser.IsOwner)
        {
            var allowed = _currentUser.BranchIds.ToArray();
            q = q.Where(p => allowed.Contains(p.BranchId));
        }

        var grouped = await q
            .GroupBy(p => p.Method)
            .Select(g => new PaymentMethodBreakdownDto(g.Key, g.Sum(p => p.Amount), g.Count()))
            .ToListAsync(ct);

        return new PaymentMethodBreakdownResponse(grouped, grouped.Sum(x => x.Amount));
    }
}
