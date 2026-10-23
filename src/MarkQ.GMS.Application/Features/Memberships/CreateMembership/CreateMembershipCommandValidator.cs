using FluentValidation;

namespace MarkQ.GMS.Application.Features.Memberships.CreateMembership;

public class CreateMembershipCommandValidator : AbstractValidator<CreateMembershipCommand>
{
    public CreateMembershipCommandValidator()
    {
        RuleFor(x => x.MemberId).NotEmpty();
        RuleFor(x => x.PlanId).NotEmpty();
        RuleFor(x => x.StartDate).NotEmpty();

        RuleFor(x => x.EndDateOverride)
            .GreaterThan(x => x.StartDate)
            .When(x => x.EndDateOverride.HasValue)
            .WithMessage("End date must be after start date.");

        RuleFor(x => x.RegistrationFeeOverride)
            .GreaterThanOrEqualTo(0)
            .When(x => x.RegistrationFeeOverride.HasValue);

        RuleFor(x => x.DiscountOverride)
            .GreaterThanOrEqualTo(0)
            .When(x => x.DiscountOverride.HasValue);

        RuleFor(x => x.Notes).MaximumLength(2000);
        RuleFor(x => x.DiscountReason).MaximumLength(500);
        RuleFor(x => x.EndDateOverrideReason).MaximumLength(500);
    }
}
