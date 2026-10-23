using MediatR;

namespace MarkQ.GMS.Application.Features.Branches.GetBranches;

public record GetBranchesQuery(string? Search) : IRequest<IReadOnlyCollection<BranchDto>>;
