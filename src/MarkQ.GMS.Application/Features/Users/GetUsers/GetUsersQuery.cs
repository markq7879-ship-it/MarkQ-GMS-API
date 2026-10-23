using MediatR;

namespace MarkQ.GMS.Application.Features.Users.GetUsers;

public record UserSummaryDto(
    Guid Id, string Email, string FullName, string? Phone, string Role,
    bool IsActive, DateTime? LastLoginAt, IReadOnlyCollection<Guid> BranchIds);

public record GetUsersQuery(string? Search) : IRequest<IReadOnlyCollection<UserSummaryDto>>;
