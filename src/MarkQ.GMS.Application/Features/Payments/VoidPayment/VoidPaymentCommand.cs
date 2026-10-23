using MediatR;

namespace MarkQ.GMS.Application.Features.Payments.VoidPayment;

public record VoidPaymentCommand(Guid Id, string Reason) : IRequest<Unit>;
