using MediatR;

namespace MarkQ.GMS.Application.Features.Auth.Login;

public record LoginCommand(string Email, string Password) : IRequest<LoginResult>;

public record LoginResult(string AccessToken, DateTime ExpiresAtUtc, UserInfoDto User);

public record UserInfoDto(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    IReadOnlyCollection<Guid> BranchIds);
