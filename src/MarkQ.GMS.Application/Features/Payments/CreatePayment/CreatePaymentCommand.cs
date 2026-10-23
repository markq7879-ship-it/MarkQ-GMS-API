using MediatR;

namespace MarkQ.GMS.Application.Features.Payments.CreatePayment;

public record CreatePaymentCommand(
    Guid MembershipId,
    decimal Amount,
    string Method,
    string? Reference,
    string? Notes) : IRequest<PaymentDto>;
