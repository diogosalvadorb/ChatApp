using ChatApp.Application.Exceptions;
using ChatApp.Domain.Entities;
using ChatApp.Domain.Ports.In;
using ChatApp.Domain.Ports.Out.Persistence;

namespace ChatApp.Application.UseCases.Messages
{
    public class MessageUseCases : IMessageUseCases
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        public MessageUseCases(IMessageRepository messageRepository, IUserRepository userRepository)
        {
            _messageRepository = messageRepository;
            _userRepository = userRepository;
        }

        public async Task<Message> SendAsync(Guid senderId, Guid recipientId, string content)
        {
            var sender = await _userRepository.FindByIdAsync(senderId)
                ?? throw new NotFoundException(nameof(User), senderId);

            var recipient = await _userRepository.FindByIdAsync(recipientId)
                ?? throw new NotFoundException(nameof(User), recipientId);

            var message = new Message(sender.Id, recipient.Id, content);

            await _messageRepository.SaveAsync(message);
            return message;
        }

        public async Task<IEnumerable<Message>> GetConversationAsync(Guid userId, Guid otherId, int page, int pageSize)
        {
            var user = await _userRepository.FindByIdAsync(userId)
                ?? throw new NotFoundException(nameof(User), userId);

            var otherUser = await _userRepository.FindByIdAsync(otherId)
                ?? throw new NotFoundException(nameof(User), otherId);

            return await _messageRepository.FindConversationAsync(user.Id, otherUser.Id, page, pageSize);
        }

        public async Task MarkAsReadAsync(Guid messageId, Guid requesterId)
        {
            var message = await _messageRepository.FindByIdAsync(messageId)
            ?? throw new NotFoundException(nameof(Message), messageId);

            if (message.RecipientId != requesterId)
                throw new UnauthorizedException("Only the recipient can mark a message as read.");

            message.MarkAsRead();
            await _messageRepository.UpdateAsync(message);
        } 
    }
}
