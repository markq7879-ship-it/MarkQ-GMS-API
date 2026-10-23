using MarkQ.GMS.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Payments;

public record MembershipBalance(decimal Total, decimal Paid, decimal Balance);

public static class PaymentCalculator
{
    public static async Task<MembershipBalance> GetBalanceAsync(
        IAppDbContext db, Guid membershipId, CancellationToken ct)
    {
        var total = await db.Memberships
            .Where(m => m.Id == membershipId)
            .Select(m => m.TotalPayable)
            .FirstOrDefaultAsync(ct);

        var paid = await db.Payments
            .Where(p => p.MembershipId == membershipId && p.Status == "COMPLETED")
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        return new MembershipBalance(total, paid, total - paid);
    }
}
