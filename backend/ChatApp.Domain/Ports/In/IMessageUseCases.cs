using ChatApp.Domain.Entities;

namespace ChatApp.Domain.Ports.In
{
    public interface IMessageUseCases
    {
        Task<Message> SendAsync(Guid senderId, Guid recipientId, string content);
        Task<IEnumerable<Message>> GetConversationAsync(Guid userId, Guid otherId, int page, int pageSize);
        Task MarkAsReadAsync(Guid messageId, Guid requesterId);
    }
}
