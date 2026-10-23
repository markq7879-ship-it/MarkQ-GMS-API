using FluentValidation;

namespace MarkQ.GMS.Application.Features.Members.CreateMember;

public class CreateMemberCommandValidator : AbstractValidator<CreateMemberCommand>
{
    public CreateMemberCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Mobile).NotEmpty().MaximumLength(20)
            .Matches(@"^[0-9+\-() ]{6,20}$").WithMessage("Mobile number format is invalid.");
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.BranchId).NotEmpty();

        RuleFor(x => x.DateOfBirth)
            .Must(d => !d.HasValue || d.Value <= DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Date of birth cannot be in the future.");

        RuleFor(x => x.PhotoBase64).MaximumLength(1_500_000)
            .When(x => !string.IsNullOrWhiteSpace(x.PhotoBase64))
            .WithMessage("Photo is too large. Please use a smaller image.");
        RuleFor(x => x.PhotoContentType).MaximumLength(50)
            .When(x => !string.IsNullOrWhiteSpace(x.PhotoContentType));
    }
}
