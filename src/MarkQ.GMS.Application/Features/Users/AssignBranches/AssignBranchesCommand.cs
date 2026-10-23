using MediatR;

namespace MarkQ.GMS.Application.Features.Users.AssignBranches;

public record AssignBranchesCommand(Guid UserId, IReadOnlyCollection<Guid> BranchIds) : IRequest<Unit>;
