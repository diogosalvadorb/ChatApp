using ChatApp.Domain.Enum;

namespace ChatApp.Domain.Entities
{
    public class Contact
    {
        public Guid Id { get; private set; }
        public Guid RequesterId { get; private set; }
        public User? Requester { get; private set; }
        public Guid AddresseeId { get; private set; }
        public User? Addressee { get; private set; }
        public ContactRequestStatus Status { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? RespondedAt { get; private set; }

    }
}
