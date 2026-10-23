using MarkQ.GMS.Domain.Common;

namespace MarkQ.GMS.Domain.Entities;

public class Membership : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    public Guid MemberId { get; set; }
    public Member? Member { get; set; }

    public Guid PlanId { get; set; }
    public MembershipPlan? Plan { get; set; }

    public string MembershipNumber { get; set; } = string.Empty;

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }

    public DateOnly? FrozenFrom { get; set; }
    public DateOnly? FrozenTo { get; set; }
    public string? FreezeReason { get; set; }

    public DateTime? CancelledAt { get; set; }
    public string? CancelReason { get; set; }

    public decimal PriceAtPurchase { get; set; }
    public decimal RegistrationFeeAtPurchase { get; set; }
    public decimal DiscountAtPurchase { get; set; }
    public string? DiscountReason { get; set; }
    public decimal GstPercentAtPurchase { get; set; }
    public bool GstIncludedAtPurchase { get; set; }
    public decimal TotalPayable { get; set; }

    public bool EndDateOverridden { get; set; }
    public string? EndDateOverrideReason { get; set; }

    public DateOnly? PaymentDueDate { get; set; }
    public string? Notes { get; set; }
}
