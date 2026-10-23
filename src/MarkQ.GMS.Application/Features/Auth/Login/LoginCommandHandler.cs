using MarkQ.GMS.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Auth.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResult>
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly IDateTimeProvider _clock;

    public LoginCommandHandler(IAppDbContext db, IPasswordHasher hasher,
        IJwtTokenService jwt, IDateTimeProvider clock)
    {
        _db = db; _hasher = hasher; _jwt = jwt; _clock = clock;
    }

    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _db.Users
            .Include(u => u.BranchAssignments)
            .FirstOrDefaultAsync(u => u.Email == email, ct);

        if (user is null || !_hasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("This user account is disabled.");

        user.LastLoginAt = _clock.UtcNow;
        await _db.SaveChangesAsync(ct);

        var branchIds = user.BranchAssignments.Select(ub => ub.BranchId).ToArray();
        var token = _jwt.CreateToken(user.Id, user.Email, user.Role, branchIds);

        return new LoginResult(
            token.AccessToken,
            token.ExpiresAtUtc,
            new UserInfoDto(user.Id, user.Email, user.FullName, user.Role, branchIds));
    }
}
