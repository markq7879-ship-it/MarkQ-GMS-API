using Hangfire.Dashboard;

namespace MarkQ.GMS.API;

public class AllowAllDashboardAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) => true;
}
