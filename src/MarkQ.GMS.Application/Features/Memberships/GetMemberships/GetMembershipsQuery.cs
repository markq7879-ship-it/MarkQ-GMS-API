using MediatR;

namespace MarkQ.GMS.Application.Features.Memberships.GetMemberships;

public record GetMembershipsQuery(string? Search, Guid? MemberId = null) : IRequest<IReadOnlyCollection<MembershipDto>>;
