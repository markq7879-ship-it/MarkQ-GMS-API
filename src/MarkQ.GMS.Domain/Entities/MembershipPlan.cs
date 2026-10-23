using MarkQ.GMS.Domain.Common;

namespace MarkQ.GMS.Domain.Entities;

public class MembershipPlan : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    public string Name { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public decimal BasePrice { get; set; }
    public decimal RegistrationFee { get; set; }
    public decimal Discount { get; set; }
    public decimal GstPercent { get; set; }
    public bool GstIncluded { get; set; }
    public bool FreezeEligible { get; set; }
    public int MaxFreezeDays { get; set; }
    public bool IsActive { get; set; } = true;
}
