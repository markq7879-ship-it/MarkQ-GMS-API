using MediatR;

namespace MarkQ.GMS.Application.Features.Users.ToggleUserStatus;

public record ToggleUserStatusCommand(Guid UserId, bool IsActive) : IRequest<Unit>;
