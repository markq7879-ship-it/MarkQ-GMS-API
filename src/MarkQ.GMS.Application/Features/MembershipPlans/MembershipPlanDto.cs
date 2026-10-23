namespace MarkQ.GMS.Application.Features.MembershipPlans;

public record MembershipPlanDto(
    Guid Id,
    string Name,
    int DurationDays,
    decimal BasePrice,
    decimal RegistrationFee,
    decimal Discount,
    decimal GstPercent,
    bool GstIncluded,
    bool FreezeEligible,
    int MaxFreezeDays,
    bool IsActive);
