using MediatR;

namespace MarkQ.GMS.Application.Features.Branches.CreateBranch;

public record CreateBranchCommand(string Name) : IRequest<BranchDto>;
