using MediatR;

namespace MarkQ.GMS.Application.Features.Members.CancelMember;

public record CancelMemberCommand(Guid Id, string Reason) : IRequest<MemberDto>;
