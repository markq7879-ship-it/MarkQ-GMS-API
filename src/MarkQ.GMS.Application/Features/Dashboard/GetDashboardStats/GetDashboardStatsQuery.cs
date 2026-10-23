using MediatR;

namespace MarkQ.GMS.Application.Features.Dashboard.GetDashboardStats;

public record GetDashboardStatsQuery : IRequest<DashboardStatsDto>;
