using MediatR;

namespace MarkQ.GMS.Application.Features.Memberships.CreateMembership;

public record CreateMembershipCommand(
    Guid MemberId,
    Guid PlanId,
    DateOnly StartDate,
    DateOnly? EndDateOverride,
    string? EndDateOverrideReason,
    decimal? RegistrationFeeOverride,
    decimal? DiscountOverride,
    string? DiscountReason,
    DateOnly? PaymentDueDate,
    string? Notes) : IRequest<MembershipDto>;
