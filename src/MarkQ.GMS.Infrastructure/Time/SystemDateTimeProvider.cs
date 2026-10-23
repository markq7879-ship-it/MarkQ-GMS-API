using MarkQ.GMS.Application.Abstractions;

namespace MarkQ.GMS.Infrastructure.Time;

public class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
