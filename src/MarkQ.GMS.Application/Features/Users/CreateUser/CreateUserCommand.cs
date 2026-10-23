using MarkQ.GMS.Application.Features.Auth.Login;
using MediatR;

namespace MarkQ.GMS.Application.Features.Users.CreateUser;

public record CreateUserCommand(
    string Email,
    string Password,
    string FullName,
    string? Phone,
    string Role,
    IReadOnlyCollection<Guid> BranchIds) : IRequest<UserInfoDto>;
