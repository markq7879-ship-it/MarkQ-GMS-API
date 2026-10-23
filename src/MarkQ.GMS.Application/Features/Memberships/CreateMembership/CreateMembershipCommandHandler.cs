using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MarkQ.GMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Memberships.CreateMembership;

public class CreateMembershipCommandHandler : IRequestHandler<CreateMembershipCommand, MembershipDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public CreateMembershipCommandHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<MembershipDto> Handle(CreateMembershipCommand r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        if (r.EndDateOverride.HasValue && !_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can override the end date.");
        if (r.RegistrationFeeOverride.HasValue && !_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can override the registration fee.");
        if (r.DiscountOverride.HasValue && !_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can override the discount.");

        var member = await _db.Members
            .Include(m => m.Branch)
            .FirstOrDefaultAsync(m => m.Id == r.MemberId && m.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Member not found.");

        if (!_currentUser.IsOwner && !_currentUser.BranchIds.Contains(member.BranchId))
            throw new ForbiddenException("You do not have access to this member's branch.");

        var plan = await _db.MembershipPlans
            .FirstOrDefaultAsync(p => p.Id == r.PlanId && p.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Membership plan not found.");

        if (!plan.IsActive)
            throw new ConflictException("This membership plan is inactive.");

        var today = DateOnly.FromDateTime(_clock.UtcNow);
        var hasActive = await _db.Memberships.AnyAsync(x =>
            x.MemberId == member.Id && x.CancelledAt == null && x.EndDate >= today, ct);

        if (hasActive)
            throw new ConflictException("This member already has an active membership. Renew or cancel it first.");

        var endDate = r.EndDateOverride ?? r.StartDate.AddDays(plan.DurationDays);
        var endDateOverridden = r.EndDateOverride.HasValue;

        var regFee = r.RegistrationFeeOverride ?? plan.RegistrationFee;
        var discount = r.DiscountOverride ?? plan.Discount;

        var (total, _, _) = MembershipPricing.Calculate(
            plan.BasePrice, regFee, discount, plan.GstPercent, plan.GstIncluded);

        var branchCode = member.Branch?.Code ?? "XX";
        var prefix = $"MS-{branchCode}-";
        var lastNum = await _db.Memberships
            .Where(x => x.OrganizationId == me.OrganizationId && x.MembershipNumber.StartsWith(prefix))
            .OrderByDescending(x => x.MembershipNumber)
            .Select(x => x.MembershipNumber)
            .FirstOrDefaultAsync(ct);

        var nextSeq = 1;
        if (!string.IsNullOrEmpty(lastNum))
        {
            var suffix = lastNum.Substring(prefix.Length);
            if (int.TryParse(suffix, out var n)) nextSeq = n + 1;
        }
        var membershipNumber = $"{prefix}{nextSeq:D6}";

        var membership = new Membership
        {
            OrganizationId = me.OrganizationId,
            MemberId = member.Id,
            PlanId = plan.Id,
            MembershipNumber = membershipNumber,
            StartDate = r.StartDate,
            EndDate = endDate,
            EndDateOverridden = endDateOverridden,
            EndDateOverrideReason = endDateOverridden ? r.EndDateOverrideReason?.Trim() : null,
            PriceAtPurchase = plan.BasePrice,
            RegistrationFeeAtPurchase = regFee,
            DiscountAtPurchase = discount,
            DiscountReason = string.IsNullOrWhiteSpace(r.DiscountReason) ? null : r.DiscountReason.Trim(),
            GstPercentAtPurchase = plan.GstPercent,
            GstIncludedAtPurchase = plan.GstIncluded,
            TotalPayable = total,
            PaymentDueDate = r.PaymentDueDate,
            Notes = string.IsNullOrWhiteSpace(r.Notes) ? null : r.Notes.Trim()
        };

        _db.Memberships.Add(membership);
        await _db.SaveChangesAsync(ct);

        return new MembershipDto(
            membership.Id, membership.MembershipNumber,
            member.Id, member.MemberCode, member.FullName,
            plan.Id, plan.Name,
            membership.StartDate, membership.EndDate, "ACTIVE",
            null, null, null,
            membership.PaymentDueDate, membership.Notes, membership.DiscountReason,
            membership.EndDateOverridden, membership.EndDateOverrideReason,
            membership.PriceAtPurchase, membership.RegistrationFeeAtPurchase, membership.DiscountAtPurchase,
            membership.GstPercentAtPurchase, membership.GstIncludedAtPurchase, membership.TotalPayable,
            0m, membership.TotalPayable, "PENDING");
    }
}
