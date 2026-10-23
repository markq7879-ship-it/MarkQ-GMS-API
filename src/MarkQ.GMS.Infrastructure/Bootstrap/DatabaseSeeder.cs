using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Domain.Constants;
using MarkQ.GMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MarkQ.GMS.Infrastructure.Bootstrap;

public class DatabaseSeeder
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly BootstrapOptions _options;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(IAppDbContext db, IPasswordHasher hasher,
        IOptions<BootstrapOptions> options, ILogger<DatabaseSeeder> logger)
    {
        _db = db; _hasher = hasher; _options = options.Value; _logger = logger;
    }

    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (!_options.Enabled) { _logger.LogInformation("Bootstrap disabled."); return; }

        if (await _db.Users.AnyAsync(ct)) { _logger.LogInformation("Users exist. Skipping."); return; }

        if (string.IsNullOrWhiteSpace(_options.OwnerEmail) ||
            string.IsNullOrWhiteSpace(_options.OwnerPassword))
        { _logger.LogWarning("Bootstrap missing credentials. Skipping."); return; }

        var org = new Organization { Name = _options.OrganizationName, IsActive = true };
        var owner = new User
        {
            OrganizationId = org.Id,
            Email = _options.OwnerEmail.Trim().ToLowerInvariant(),
            PasswordHash = _hasher.Hash(_options.OwnerPassword),
            FullName = _options.OwnerFullName,
            Role = AppRoles.Owner,
            IsActive = true
        };

        _db.Organizations.Add(org);
        _db.Users.Add(owner);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Bootstrap complete. Owner: {Email}", owner.Email);
    }
}
