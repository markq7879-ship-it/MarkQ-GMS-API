using MediatR;

namespace MarkQ.GMS.Application.Features.Payments.GetPayment;

public record GetPaymentQuery(Guid Id) : IRequest<PaymentDto>;
