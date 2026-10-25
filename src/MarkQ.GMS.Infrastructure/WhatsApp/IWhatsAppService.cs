namespace MarkQ.GMS.Infrastructure.WhatsApp;

public interface IWhatsAppService
{
    /// <summary>
    /// Send a template message. Returns true on success.
    /// </summary>
    Task<bool> SendTemplateAsync(
        string toPhoneE164,
        string templateName,
        IReadOnlyList<string> parameters,
        CancellationToken ct = default);
}
