namespace ChatApp.Domain.Entities
{
    public class Message
    {
        public Guid Id { get; private set; }
        public Guid SenderId { get; private set; }
        public User? Sender { get; private set; }
        public Guid RecipientId { get; private set; }
        public User? Recipient { get; private set; }
        public string Content { get; private set; } = string.Empty;
        public DateTime SentAt { get; private set; }
        public bool IsRead { get; private set; }
    }
}
