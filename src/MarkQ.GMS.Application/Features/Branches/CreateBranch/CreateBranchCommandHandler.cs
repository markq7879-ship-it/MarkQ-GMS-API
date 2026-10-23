using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MarkQ.GMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Branches.CreateBranch;

public class CreateBranchCommandHandler : IRequestHandler<CreateBranchCommand, BranchDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateBranchCommandHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<BranchDto> Handle(CreateBranchCommand request, CancellationToken ct)
    {
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can create branches.");

        var owner = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId!.Value, ct);
        var code = await GenerateNextCodeAsync(owner.OrganizationId, ct);

        var branch = new Branch
        {
            OrganizationId = owner.OrganizationId,
            Code = code,
            Name = request.Name.Trim(),
            IsActive = true
        };

        _db.Branches.Add(branch);
        await _db.SaveChangesAsync(ct);

        return new BranchDto(branch.Id, branch.Code, branch.Name, branch.IsActive, branch.CreatedAt);
    }

    private async Task<string> GenerateNextCodeAsync(Guid organizationId, CancellationToken ct)
    {
        var codes = await _db.Branches
            .Where(b => b.OrganizationId == organizationId)
            .Select(b => b.Code)
            .ToListAsync(ct);

        var max = codes
            .Select(c => c.Length > 1 && int.TryParse(c.Substring(1), out var n) ? n : 0)
            .DefaultIfEmpty(0)
            .Max();

        return $"B{(max + 1):D2}";
    }
}
