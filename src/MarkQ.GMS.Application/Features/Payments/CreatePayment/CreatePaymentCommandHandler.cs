using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MarkQ.GMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Payments.CreatePayment;

public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, PaymentDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public CreatePaymentCommandHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<PaymentDto> Handle(CreatePaymentCommand r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var membership = await _db.Memberships
            .Include(m => m.Member).ThenInclude(m => m!.Branch)
            .Include(m => m.Plan)
            .FirstOrDefaultAsync(m => m.Id == r.MembershipId && m.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Membership not found.");

        if (!_currentUser.IsOwner && !_currentUser.BranchIds.Contains(membership.Member!.BranchId))
            throw new ForbiddenException("You do not have access to this membership.");

        if (membership.CancelledAt.HasValue)
            throw new ConflictException("Cannot record payment on a cancelled membership.");

        var paidBefore = await _db.Payments
            .Where(p => p.MembershipId == membership.Id && p.Status == "COMPLETED")
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        var balanceBefore = membership.TotalPayable - paidBefore;

        if (balanceBefore <= 0)
            throw new ConflictException("This membership is already fully paid.");

        if (r.Amount > balanceBefore)
            throw new ConflictException(
                $"Amount exceeds outstanding balance of ₹{balanceBefore:F2}.");

        var balanceAfter = balanceBefore - r.Amount;
        var now = _clock.UtcNow;
        var year = now.Year;

        var branchCode = membership.Member!.Branch!.Code;
        var prefix = $"REC-{branchCode}-{year}-";
        var lastReceipt = await _db.Payments
            .Where(p => p.OrganizationId == me.OrganizationId && p.ReceiptNumber.StartsWith(prefix))
            .OrderByDescending(p => p.ReceiptNumber)
            .Select(p => p.ReceiptNumber)
            .FirstOrDefaultAsync(ct);

        var nextSeq = 1;
        if (!string.IsNullOrEmpty(lastReceipt))
        {
            var suffix = lastReceipt.Substring(prefix.Length);
            if (int.TryParse(suffix, out var n)) nextSeq = n + 1;
        }
        var receiptNumber = $"{prefix}{nextSeq:D6}";

        var payment = new Payment
        {
            OrganizationId = me.OrganizationId,
            MembershipId = membership.Id,
            MemberId = membership.MemberId,
            BranchId = membership.Member!.BranchId,
            ReceiptNumber = receiptNumber,
            Amount = r.Amount,
            Method = r.Method,
            Reference = string.IsNullOrWhiteSpace(r.Reference) ? null : r.Reference.Trim(),
            PaidAt = now,
            Status = "COMPLETED",
            ReceivedByUserId = me.Id,
            ReceivedByName = me.FullName,
            Notes = string.IsNullOrWhiteSpace(r.Notes) ? null : r.Notes.Trim()
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync(ct);

        return new PaymentDto(
            payment.Id,
            payment.ReceiptNumber,
            membership.Id,
            membership.MembershipNumber,
            membership.MemberId,
            membership.Member!.MemberCode,
            membership.Member!.FullName,
            membership.Member!.Mobile,
            membership.Member!.WhatsApp,
            payment.Amount,
            payment.Method,
            payment.Reference,
            payment.PaidAt,
            payment.Status,
            payment.ReceivedByName,
            null, null, null,
            payment.Notes,
            membership.TotalPayable,
            paidBefore,
            balanceBefore,
            balanceAfter);
    }
}
