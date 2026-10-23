using MediatR;

namespace MarkQ.GMS.Application.Features.MembershipPlans.TogglePlanStatus;

public record TogglePlanStatusCommand(Guid Id, bool IsActive) : IRequest<Unit>;
