using MarkQ.GMS.Application.Features.Users.GetUsers;
using MediatR;

namespace MarkQ.GMS.Application.Features.Users.UpdateUser;

public record UpdateUserCommand(
    Guid UserId, string FullName, string? Phone, string Role) : IRequest<UserSummaryDto>;
