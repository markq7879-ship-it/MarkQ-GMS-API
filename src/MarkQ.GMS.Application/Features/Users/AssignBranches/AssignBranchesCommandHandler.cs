using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MarkQ.GMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Users.AssignBranches;

public class AssignBranchesCommandHandler : IRequestHandler<AssignBranchesCommand, Unit>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AssignBranchesCommandHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<Unit> Handle(AssignBranchesCommand request, CancellationToken ct)
    {
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can assign branches.");

        var user = await _db.Users.Include(u => u.BranchAssignments)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, ct)
            ?? throw new NotFoundException("User not found.");

        var validBranchIds = await _db.Branches
            .Where(b => request.BranchIds.Contains(b.Id) && b.OrganizationId == user.OrganizationId)
            .Select(b => b.Id)
            .ToListAsync(ct);

        _db.UserBranches.RemoveRange(user.BranchAssignments);

        foreach (var branchId in validBranchIds.Distinct())
            _db.UserBranches.Add(new UserBranch { UserId = user.Id, BranchId = branchId });

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
