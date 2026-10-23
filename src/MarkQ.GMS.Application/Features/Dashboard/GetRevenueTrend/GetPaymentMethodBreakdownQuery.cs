using MediatR;

namespace MarkQ.GMS.Application.Features.Dashboard.GetRevenueTrend;

public record GetPaymentMethodBreakdownQuery : IRequest<PaymentMethodBreakdownResponse>;
