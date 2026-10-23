namespace MarkQ.GMS.Infrastructure.Bootstrap;

public class BootstrapOptions
{
    public const string SectionName = "Bootstrap";

    public bool Enabled { get; set; }
    public string OwnerEmail { get; set; } = string.Empty;
    public string OwnerPassword { get; set; } = string.Empty;
    public string OwnerFullName { get; set; } = "Gym Owner";
    public string OrganizationName { get; set; } = "My Gym";
}
