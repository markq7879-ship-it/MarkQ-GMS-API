using MediatR;

namespace MarkQ.GMS.Application.Features.MembershipPlans.UpdatePlan;

public record UpdatePlanCommand(
    Guid Id,
    string Name,
    int DurationDays,
    decimal BasePrice,
    decimal RegistrationFee,
    decimal Discount,
    decimal GstPercent,
    bool GstIncluded,
    bool FreezeEligible,
    int MaxFreezeDays) : IRequest<MembershipPlanDto>;
