using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MarkQ.GMS.Infrastructure.Jobs;

public class MembershipExpiryReminderJob
{
    private static readonly TimeZoneInfo GymTz = ResolveTz();

    private static TimeZoneInfo ResolveTz()
    {
        try
        {
            var id = OperatingSystem.IsWindows() ? "India Standard Time" : "Asia/Kolkata";
            return TimeZoneInfo.FindSystemTimeZoneById(id);
        }
        catch { return TimeZoneInfo.Utc; }
    }

    private readonly IAppDbContext _db;
    private readonly IWhatsAppService _whatsApp;
    private readonly WhatsAppOptions _options;
    private readonly ILogger<MembershipExpiryReminderJob> _logger;

    public MembershipExpiryReminderJob(
        IAppDbContext db,
        IWhatsAppService whatsApp,
        IOptions<WhatsAppOptions> options,
        ILogger<MembershipExpiryReminderJob> logger)
    {
        _db = db;
        _whatsApp = whatsApp;
        _options = options.Value;
        _logger = logger;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("Expiry reminders disabled — job skipped");
            return;
        }

        // IST today
        var nowUtc = DateTime.UtcNow;
        var nowGym = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, GymTz);
        var today = DateOnly.FromDateTime(nowGym);

        _logger.LogInformation("Expiry reminder job started for {Date}", today);

        // Memberships ending TODAY, not cancelled, no reminder sent yet
        var targets = await _db.Memberships
            .Include(x => x.Member)
            .Where(x => x.CancelledAt == null
                     && x.EndDate == today
                     && x.ExpiryReminderSentAt == null
                     && x.Member != null
                     && x.Member.CancelledAt == null)
            .ToListAsync(ct);

        if (targets.Count == 0)
        {
            _logger.LogInformation("No memberships expiring today");
            return;
        }

        var sent = 0;
        var failed = 0;

        foreach (var ms in targets)
        {
            var phone = (ms.Member!.WhatsApp ?? "").Trim();
            if (string.IsNullOrWhiteSpace(phone)) phone = ms.Member.Mobile;

            if (string.IsNullOrWhiteSpace(phone))
            {
                _logger.LogWarning("Skipping {Membership} — member has no phone", ms.MembershipNumber);
                failed++;
                continue;
            }

            try
            {
                var ok = await _whatsApp.SendTemplateAsync(
                    phone,
                    _options.TemplateName,
                    new[] { ms.Member.FullName, ms.EndDate.ToString("dd MMM yyyy") },
                    ct);

                if (ok)
                {
                    ms.ExpiryReminderSentAt = nowUtc;
                    sent++;
                }
                else
                {
                    failed++;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed sending to {Membership}", ms.MembershipNumber);
                failed++;
            }
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Expiry reminders sent={Sent} failed={Failed} total={Total}", sent, failed, targets.Count);
    }
}
