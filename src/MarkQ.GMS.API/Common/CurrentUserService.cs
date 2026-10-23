using System.Security.Claims;
using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Domain.Constants;

namespace MarkQ.GMS.API.Common;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor accessor)
    {
        _httpContextAccessor = accessor;
    }

    private ClaimsPrincipal? Principal => _httpContextAccessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var value = Principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? Principal?.FindFirstValue("sub");
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public string? Role => Principal?.FindFirstValue(ClaimTypes.Role);

    public IReadOnlyCollection<Guid> BranchIds =>
        Principal?.FindAll("branch_id")
            .Select(c => Guid.TryParse(c.Value, out var g) ? g : Guid.Empty)
            .Where(g => g != Guid.Empty)
            .ToArray()
        ?? Array.Empty<Guid>();

    public bool IsOwner => string.Equals(Role, AppRoles.Owner, StringComparison.OrdinalIgnoreCase);
}
