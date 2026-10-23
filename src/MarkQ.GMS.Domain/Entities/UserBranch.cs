using MarkQ.GMS.Domain.Common;

namespace MarkQ.GMS.Domain.Entities;

public class UserBranch : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid BranchId { get; set; }
    public Branch? Branch { get; set; }
}
