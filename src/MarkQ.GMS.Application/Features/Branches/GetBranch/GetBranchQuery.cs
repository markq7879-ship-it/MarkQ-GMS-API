using MediatR;

namespace MarkQ.GMS.Application.Features.Branches.GetBranch;

public record GetBranchQuery(Guid Id) : IRequest<BranchDto>;
