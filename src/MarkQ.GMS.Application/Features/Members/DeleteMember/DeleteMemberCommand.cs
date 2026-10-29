using MediatR;

namespace MarkQ.GMS.Application.Features.Members.DeleteMember;

public record DeleteMemberCommand(Guid Id) : IRequest<Unit>;
