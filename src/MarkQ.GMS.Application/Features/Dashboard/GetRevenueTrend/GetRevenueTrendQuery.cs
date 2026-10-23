using MediatR;

namespace MarkQ.GMS.Application.Features.Dashboard.GetRevenueTrend;

public record GetRevenueTrendQuery(int Months = 6) : IRequest<RevenueTrendDto>;
