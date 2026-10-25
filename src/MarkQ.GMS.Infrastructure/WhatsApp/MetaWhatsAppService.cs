using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MarkQ.GMS.Infrastructure.WhatsApp;

public class MetaWhatsAppService : IWhatsAppService
{
    private readonly HttpClient _http;
    private readonly WhatsAppOptions _options;
    private readonly ILogger<MetaWhatsAppService> _logger;

    public MetaWhatsAppService(
        HttpClient http,
        IOptions<WhatsAppOptions> options,
        ILogger<MetaWhatsAppService> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<bool> SendTemplateAsync(
        string toPhoneE164,
        string templateName,
        IReadOnlyList<string> parameters,
        CancellationToken ct = default)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("WhatsApp disabled — skipping send to {Phone}", toPhoneE164);
            return false;
        }

        if (string.IsNullOrWhiteSpace(_options.AccessToken) ||
            string.IsNullOrWhiteSpace(_options.PhoneNumberId))
        {
            _logger.LogWarning("WhatsApp credentials missing — cannot send");
            return false;
        }

        // Normalize phone: strip everything except digits, prepend 91 if 10 digits
        var digits = new string(toPhoneE164.Where(char.IsDigit).ToArray());
        if (digits.Length == 10) digits = "91" + digits;
        if (digits.Length == 11 && digits.StartsWith("0")) digits = "91" + digits.Substring(1);
        if (string.IsNullOrWhiteSpace(digits))
        {
            _logger.LogWarning("Empty phone — cannot send");
            return false;
        }

        var payload = new
        {
            messaging_product = "whatsapp",
            to = digits,
            type = "template",
            template = new
            {
                name = templateName,
                language = new { code = _options.LanguageCode },
                components = new object[]
                {
                    new
                    {
                        type = "body",
                        parameters = parameters.Select(p => new { type = "text", text = p ?? "" }).ToArray()
                    }
                }
            }
        };

        var url = $"https://graph.facebook.com/v20.0/{_options.PhoneNumberId}/messages";
        using var req = new HttpRequestMessage(HttpMethod.Post, url);
        req.Headers.Add("Authorization", $"Bearer {_options.AccessToken}");
        req.Content = JsonContent.Create(payload);

        try
        {
            using var resp = await _http.SendAsync(req, ct);
            var body = await resp.Content.ReadAsStringAsync(ct);
            if (resp.IsSuccessStatusCode)
            {
                _logger.LogInformation("WhatsApp sent to {Phone} — {Status}", digits, (int)resp.StatusCode);
                return true;
            }
            _logger.LogWarning("WhatsApp FAILED to {Phone}: {Status} {Body}", digits, (int)resp.StatusCode, body);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "WhatsApp exception sending to {Phone}", digits);
            return false;
        }
    }
}
