using FluentValidation;

namespace MarkQ.GMS.Application.Features.Payments.CreatePayment;

public class CreatePaymentCommandValidator : AbstractValidator<CreatePaymentCommand>
{
    private static readonly string[] ValidMethods = { "CASH", "UPI", "BANK_TRANSFER" };

    public CreatePaymentCommandValidator()
    {
        RuleFor(x => x.MembershipId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than zero.");
        RuleFor(x => x.Method).NotEmpty()
            .Must(m => ValidMethods.Contains(m))
            .WithMessage("Method must be CASH, UPI, or BANK_TRANSFER.");

        RuleFor(x => x.Reference)
            .NotEmpty()
            .When(x => x.Method == "UPI" || x.Method == "BANK_TRANSFER")
            .WithMessage("Transaction reference (UTR) is required for UPI and Bank Transfer.");

        RuleFor(x => x.Reference).MaximumLength(100);
        RuleFor(x => x.Notes).MaximumLength(2000);
    }
}
