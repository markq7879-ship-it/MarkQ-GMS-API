using MediatR;

namespace MarkQ.GMS.Application.Features.Branches.UpdateBranch;

public record UpdateBranchCommand(Guid Id, string Name) : IRequest<BranchDto>;
