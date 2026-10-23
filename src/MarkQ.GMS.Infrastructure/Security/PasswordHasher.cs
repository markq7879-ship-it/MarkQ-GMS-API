using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace MarkQ.GMS.Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<User> _inner = new();

    public string Hash(string password) => _inner.HashPassword(null!, password);

    public bool Verify(string password, string passwordHash)
    {
        var result = _inner.VerifyHashedPassword(null!, passwordHash, password);
        return result == PasswordVerificationResult.Success
            || result == PasswordVerificationResult.SuccessRehashNeeded;
    }
}
