namespace ChatApp.Domain.Entities
{
    public class Message
    {
        public Message(Guid senderId, Guid recipientId, string content)
        {
            if (senderId == Guid.Empty)
                throw new ArgumentException("SenderId is required.");

            if (recipientId == Guid.Empty)
                throw new ArgumentException("RecipientId is required.");

            if (senderId == recipientId)
                throw new ArgumentException("Sender and recipient cannot be the same user.");

            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentException("Content is required.");

            Id = Guid.NewGuid();
            SenderId = senderId;
            RecipientId = recipientId;
            Content = content;
            SentAt = DateTime.UtcNow;
            IsRead = false;
        }

        public Guid Id { get; private set; }
        public Guid SenderId { get; private set; }
        public User? Sender { get; private set; }
        public Guid RecipientId { get; private set; }
        public User? Recipient { get; private set; }
        public string Content { get; private set; } = string.Empty;
        public DateTime SentAt { get; private set; }
        public bool IsRead { get; private set; }

        public void MarkAsRead()
        {
            IsRead = true;
        }
    }
}
