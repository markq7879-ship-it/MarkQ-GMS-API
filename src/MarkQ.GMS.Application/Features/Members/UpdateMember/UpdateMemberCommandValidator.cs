using FluentValidation;

namespace MarkQ.GMS.Application.Features.Members.UpdateMember;

public class UpdateMemberCommandValidator : AbstractValidator<UpdateMemberCommand>
{
    public UpdateMemberCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Mobile).NotEmpty().MaximumLength(20)
            .Matches(@"^[0-9+\-() ]{6,20}$").WithMessage("Mobile number format is invalid.");
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        // BranchId optional — handler keeps existing if empty

        RuleFor(x => x.DateOfBirth)
            .Must(d => !d.HasValue || d.Value <= DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Date of birth cannot be in the future.");

        RuleFor(x => x.PhotoBase64).MaximumLength(1_500_000)
            .When(x => !string.IsNullOrWhiteSpace(x.PhotoBase64));
        RuleFor(x => x.PhotoContentType).MaximumLength(50)
            .When(x => !string.IsNullOrWhiteSpace(x.PhotoContentType));
    }
}

