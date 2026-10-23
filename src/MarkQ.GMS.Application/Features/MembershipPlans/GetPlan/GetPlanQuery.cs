using MediatR;

namespace MarkQ.GMS.Application.Features.MembershipPlans.GetPlan;

public record GetPlanQuery(Guid Id) : IRequest<MembershipPlanDto>;
