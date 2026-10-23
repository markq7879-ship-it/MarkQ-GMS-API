using MediatR;

namespace MarkQ.GMS.Application.Features.MembershipPlans.GetPlans;

public record GetPlansQuery(string? Search) : IRequest<IReadOnlyCollection<MembershipPlanDto>>;
