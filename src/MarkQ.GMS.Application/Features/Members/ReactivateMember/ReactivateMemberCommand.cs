using MediatR;

namespace MarkQ.GMS.Application.Features.Members.ReactivateMember;

public record ReactivateMemberCommand(Guid Id) : IRequest<MemberDto>;
