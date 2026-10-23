namespace MarkQ.GMS.Application.Features.Dashboard;

public record DashboardStatsDto(
    int TotalMembers,
    int ActiveMembers,
    int ExpiringToday,
    int ExpiringIn7Days,
    int InactiveMembers,
    int ActiveBranches,
    int NewMembersToday,
    int NewMembersThisMonth,
    int PendingMembersCount,
    decimal TodayRevenue,
    decimal MonthlyRevenue,
    decimal TotalPendingAmount,
    bool RevenueAvailable,
    bool PendingAvailable,
    bool AttendanceAvailable,
    int PresentToday,
    DateTime AsOf);
