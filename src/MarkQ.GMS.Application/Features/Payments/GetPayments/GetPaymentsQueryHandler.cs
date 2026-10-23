using MarkQ.GMS.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Payments.GetPayments;

public class GetPaymentsQueryHandler : IRequestHandler<GetPaymentsQuery, IReadOnlyCollection<PaymentDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetPaymentsQueryHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<IReadOnlyCollection<PaymentDto>> Handle(GetPaymentsQuery r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var query = _db.Payments
            .Include(p => p.Membership)
            .Include(p => p.Member)
            .Where(p => p.OrganizationId == me.OrganizationId);

        if (!_currentUser.IsOwner)
        {
            var allowed = _currentUser.BranchIds.ToArray();
            query = query.Where(p => allowed.Contains(p.BranchId));
        }

        if (!string.IsNullOrWhiteSpace(r.Search))
        {
            var s = r.Search.Trim().ToLower();
            query = query.Where(p =>
                p.ReceiptNumber.ToLower().Contains(s) ||
                p.Member!.FullName.ToLower().Contains(s) ||
                p.Member!.MemberCode.ToLower().Contains(s));
        }

        var list = await query.OrderByDescending(p => p.PaidAt).ToListAsync(ct);

        var grouped = list.GroupBy(p => p.MembershipId)
            .ToDictionary(
                g => g.Key,
                g => g.OrderBy(p => p.PaidAt).ThenBy(p => p.CreatedAt).ToList());

        var results = new List<PaymentDto>();
        foreach (var p in list)
        {
            var chain = grouped[p.MembershipId];
            var idx = chain.FindIndex(x => x.Id == p.Id);
            var paidBefore = 0m;
            for (var i = 0; i < idx; i++)
            {
                if (chain[i].Status == "COMPLETED") paidBefore += chain[i].Amount;
            }
            var total = p.Membership?.TotalPayable ?? 0m;
            var balanceBefore = total - paidBefore;
            var balanceAfter = p.Status == "COMPLETED" ? balanceBefore - p.Amount : balanceBefore;

            results.Add(new PaymentDto(
                p.Id,
                p.ReceiptNumber,
                p.MembershipId,
                p.Membership?.MembershipNumber ?? "",
                p.MemberId,
                p.Member?.MemberCode ?? "",
                p.Member?.FullName ?? "",
                p.Member?.Mobile ?? "",
                p.Member?.WhatsApp,
                p.Amount,
                p.Method,
                p.Reference,
                p.PaidAt,
                p.Status,
                p.ReceivedByName,
                p.VoidedAt,
                p.VoidReason,
                p.VoidedByName,
                p.Notes,
                total,
                paidBefore,
                balanceBefore,
                balanceAfter));
        }

        return results;
    }
}
