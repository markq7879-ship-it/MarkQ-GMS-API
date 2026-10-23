using MediatR;

namespace MarkQ.GMS.Application.Features.Payments.GetPayments;

public record GetPaymentsQuery(string? Search) : IRequest<IReadOnlyCollection<PaymentDto>>;
