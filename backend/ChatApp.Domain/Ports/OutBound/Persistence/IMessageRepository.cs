using ChatApp.Domain.Entities;

namespace ChatApp.Domain.Ports.Out.Persistence
{
    public interface IMessageRepository
    {
        Task<Message?> FindByIdAsync(Guid id);
        Task<IEnumerable<Message>> FindConversationAsync(Guid userId, Guid otherId, int page, int pageSize);
        Task UpdateAsync(Message message);
        Task SaveAsync(Message message);
    }
}
