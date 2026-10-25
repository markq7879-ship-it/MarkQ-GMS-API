using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Options;
using MarkQ.GMS.Infrastructure.Bootstrap;
using MarkQ.GMS.Infrastructure.Jobs;
using MarkQ.GMS.Infrastructure.Persistence;
using MarkQ.GMS.Infrastructure.Security;
using MarkQ.GMS.Infrastructure.Time;
using MarkQ.GMS.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MarkQ.GMS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration config)
    {
        var cs = config.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException("Connection string 'Postgres' not configured.");

        // ---- EF Core / DbContext ----
        services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(cs));
        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        // ---- Configuration sections ----
        services.Configure<JwtOptions>(config.GetSection(JwtOptions.SectionName));
        services.Configure<BootstrapOptions>(config.GetSection(BootstrapOptions.SectionName));
        services.Configure<LimitsOptions>(config.GetSection(LimitsOptions.SectionName));
        services.Configure<WhatsAppOptions>(config.GetSection(WhatsAppOptions.SectionName));

        // ---- Core services ----
        services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<DatabaseSeeder>();

        // ---- WhatsApp (Meta Cloud API) ----
        services.AddHttpClient<IWhatsAppService, MetaWhatsAppService>(
            c => c.Timeout = TimeSpan.FromSeconds(30));

        // ---- Hangfire background jobs ----
        services.AddScoped<MembershipExpiryReminderJob>();

        return services;
    }
}
