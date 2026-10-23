namespace MarkQ.GMS.Application.Abstractions;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
