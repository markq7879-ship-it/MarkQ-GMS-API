using MediatR;

namespace MarkQ.GMS.Application.Features.Memberships.RenewMembership;

public record RenewMembershipCommand(Guid Id) : IRequest<MembershipDto>;
