using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Branches.UpdateBranch;

public class UpdateBranchCommandHandler : IRequestHandler<UpdateBranchCommand, BranchDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateBranchCommandHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<BranchDto> Handle(UpdateBranchCommand request, CancellationToken ct)
    {
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can update branches.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId!.Value, ct);

        var branch = await _db.Branches
            .FirstOrDefaultAsync(b => b.Id == request.Id && b.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Branch not found.");

        branch.Name = request.Name.Trim();
        await _db.SaveChangesAsync(ct);

        return new BranchDto(branch.Id, branch.Code, branch.Name, branch.IsActive, branch.CreatedAt);
    }
}
