using MediatR;

namespace MarkQ.GMS.Application.Features.Memberships.FreezeMembership;

public record FreezeMembershipCommand(Guid Id, DateOnly FreezeFrom, DateOnly FreezeTo, string Reason)
    : IRequest<MembershipDto>;
