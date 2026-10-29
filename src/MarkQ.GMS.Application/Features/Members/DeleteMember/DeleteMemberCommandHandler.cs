using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Members.DeleteMember;

public class DeleteMemberCommandHandler : IRequestHandler<DeleteMemberCommand, Unit>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteMemberCommandHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<Unit> Handle(DeleteMemberCommand r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        // Only OWNER can delete members (financial safety)
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can permanently delete members.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var member = await _db.Members
            .FirstOrDefaultAsync(m => m.Id == r.Id && m.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Member not found.");

        // Safety: cannot delete if member has any financial or operational history
        var hasMemberships = await _db.Memberships.AnyAsync(x => x.MemberId == member.Id, ct);
        var hasPayments = await _db.Payments.AnyAsync(x => x.MemberId == member.Id, ct);

        if (hasMemberships || hasPayments)
            throw new ConflictException(
                "This member has membership or payment history and cannot be deleted. " +
                "Use 'Cancel Member' instead — it preserves the financial audit trail.");

        _db.Members.Remove(member);
        await _db.SaveChangesAsync(ct);

        return Unit.Value;
    }
}
