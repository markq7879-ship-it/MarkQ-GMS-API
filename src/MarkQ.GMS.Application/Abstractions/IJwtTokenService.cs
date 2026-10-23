using System.Security.Claims;

namespace MarkQ.GMS.Application.Abstractions;

public record JwtTokenResult(string AccessToken, DateTime ExpiresAtUtc);

public interface IJwtTokenService
{
    JwtTokenResult CreateToken(
        Guid userId,
        string email,
        string role,
        IEnumerable<Guid> branchIds,
        IEnumerable<Claim>? extraClaims = null);
}
