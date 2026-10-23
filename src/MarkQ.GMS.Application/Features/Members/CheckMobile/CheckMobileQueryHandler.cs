using MarkQ.GMS.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Members.CheckMobile;

public class CheckMobileQueryHandler : IRequestHandler<CheckMobileQuery, CheckMobileResult>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CheckMobileQueryHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<CheckMobileResult> Handle(CheckMobileQuery r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        if (string.IsNullOrWhiteSpace(r.Mobile))
            return new CheckMobileResult(false, null, null);

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);
        var normalized = new string(r.Mobile.Where(c => char.IsDigit(c) || c == '+').ToArray());

        var query = _db.Members
            .Where(m => m.OrganizationId == me.OrganizationId && m.Mobile == normalized);

        if (r.ExcludeMemberId.HasValue)
            query = query.Where(m => m.Id != r.ExcludeMemberId.Value);

        var match = await query
            .Select(m => new { m.MemberCode, m.FullName })
            .FirstOrDefaultAsync(ct);

        return match is null
            ? new CheckMobileResult(false, null, null)
            : new CheckMobileResult(true, match.MemberCode, match.FullName);
    }
}
