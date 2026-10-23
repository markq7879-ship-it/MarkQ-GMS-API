using MediatR;

namespace MarkQ.GMS.Application.Features.Memberships.CancelMembership;

public record CancelMembershipCommand(Guid Id, string Reason) : IRequest<Unit>;
