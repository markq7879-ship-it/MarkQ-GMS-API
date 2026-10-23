using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Payments.GetPayment;

public class GetPaymentQueryHandler : IRequestHandler<GetPaymentQuery, PaymentDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetPaymentQueryHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<PaymentDto> Handle(GetPaymentQuery r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var p = await _db.Payments
            .Include(x => x.Membership)
            .Include(x => x.Member)
            .FirstOrDefaultAsync(x => x.Id == r.Id && x.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Payment not found.");

        if (!_currentUser.IsOwner && !_currentUser.BranchIds.Contains(p.BranchId))
            throw new ForbiddenException("You do not have access to this payment.");

        var prior = await _db.Payments
            .Where(x => x.MembershipId == p.MembershipId && x.Status == "COMPLETED"
                        && (x.PaidAt < p.PaidAt || (x.PaidAt == p.PaidAt && x.CreatedAt < p.CreatedAt)))
            .SumAsync(x => (decimal?)x.Amount, ct) ?? 0m;

        var total = p.Membership?.TotalPayable ?? 0m;
        var balanceBefore = total - prior;
        var balanceAfter = p.Status == "COMPLETED" ? balanceBefore - p.Amount : balanceBefore;

        return new PaymentDto(
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
            prior,
            balanceBefore,
            balanceAfter);
    }
}
