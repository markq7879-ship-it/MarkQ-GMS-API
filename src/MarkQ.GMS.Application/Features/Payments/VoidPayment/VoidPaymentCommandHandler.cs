using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Payments.VoidPayment;

public class VoidPaymentCommandHandler : IRequestHandler<VoidPaymentCommand, Unit>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public VoidPaymentCommandHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<Unit> Handle(VoidPaymentCommand r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var payment = await _db.Payments
            .FirstOrDefaultAsync(p => p.Id == r.Id && p.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Payment not found.");

        if (!_currentUser.IsOwner && !_currentUser.BranchIds.Contains(payment.BranchId))
            throw new ForbiddenException("You do not have access to this payment.");

        if (payment.Status == "VOIDED")
            throw new ConflictException("Payment is already voided.");

        payment.Status = "VOIDED";
        payment.VoidedAt = _clock.UtcNow;
        payment.VoidReason = r.Reason.Trim();
        payment.VoidedByUserId = me.Id;
        payment.VoidedByName = me.FullName;

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
