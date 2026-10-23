namespace MarkQ.GMS.Application.Abstractions;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Role { get; }
    IReadOnlyCollection<Guid> BranchIds { get; }
    bool IsOwner { get; }
}
