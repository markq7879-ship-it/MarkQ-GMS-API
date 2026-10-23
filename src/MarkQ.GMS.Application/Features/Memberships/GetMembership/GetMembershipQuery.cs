using MediatR;

namespace MarkQ.GMS.Application.Features.Memberships.GetMembership;

public record GetMembershipQuery(Guid Id) : IRequest<MembershipDto>;
