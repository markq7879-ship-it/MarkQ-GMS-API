namespace MarkQ.GMS.Application.Common.Options;

public class LimitsOptions
{
    public const string SectionName = "Limits";

    public int MaxBranches { get; set; } = 2;
    public int MaxUsers { get; set; } = 1;
}
