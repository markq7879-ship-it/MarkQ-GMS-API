using MediatR;

namespace MarkQ.GMS.Application.Features.Branches.ToggleBranchStatus;

public record ToggleBranchStatusCommand(Guid Id, bool IsActive) : IRequest<Unit>;
