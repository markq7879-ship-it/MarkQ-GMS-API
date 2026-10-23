using MediatR;

namespace MarkQ.GMS.Application.Features.Members.GetMembers;

public record GetMembersQuery(
    string? Search,
    Guid? BranchId,
    int Page,
    int PageSize,
    string? Filter = null) : IRequest<MemberListResult>;
