using MediatR;

namespace MarkQ.GMS.Application.Features.Members.GetMember;

public record GetMemberQuery(Guid Id) : IRequest<MemberDto>;
