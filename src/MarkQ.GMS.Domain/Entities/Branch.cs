using MarkQ.GMS.Domain.Common;

namespace MarkQ.GMS.Domain.Entities;

public class Branch : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
