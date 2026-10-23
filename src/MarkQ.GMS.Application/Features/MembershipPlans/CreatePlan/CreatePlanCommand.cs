using MediatR;

namespace MarkQ.GMS.Application.Features.MembershipPlans.CreatePlan;

public record CreatePlanCommand(
    string Name,
    int DurationDays,
    decimal BasePrice,
    decimal RegistrationFee,
    decimal Discount,
    decimal GstPercent,
    bool GstIncluded,
    bool FreezeEligible,
    int MaxFreezeDays) : IRequest<MembershipPlanDto>;
