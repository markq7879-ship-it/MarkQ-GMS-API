using MediatR;

namespace MarkQ.GMS.Application.Features.Members.CheckMobile;

public record CheckMobileQuery(string Mobile, Guid? ExcludeMemberId) : IRequest<CheckMobileResult>;
