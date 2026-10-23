namespace MarkQ.GMS.Application.Features.Branches;

public record BranchDto(
    Guid Id,
    string Code,
    string Name,
    bool IsActive,
    DateTime CreatedAt);
