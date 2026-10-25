namespace MarkQ.GMS.Infrastructure.WhatsApp;

public class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";

    /// <summary>Master switch. Set to false in dev to avoid accidental sends.</summary>
    public bool Enabled { get; set; } = false;

    /// <summary>Meta Cloud API permanent access token.</summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>Meta WhatsApp phone number ID (not the phone number itself).</summary>
    public string PhoneNumberId { get; set; } = string.Empty;

    /// <summary>Approved template name. Must match exactly.</summary>
    public string TemplateName { get; set; } = "membership_expires_today";

    /// <summary>Template language code (e.g., en, en_US, hi).</summary>
    public string LanguageCode { get; set; } = "en";
}
