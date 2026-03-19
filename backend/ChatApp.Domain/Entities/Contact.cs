using ChatApp.Domain.Enum;

namespace ChatApp.Domain.Entities
{
    public class Contact
    {
        public Contact(Guid requesterId, Guid addresseeId)
        {
            if (requesterId == Guid.Empty)
                throw new ArgumentException("RequesterId is required.");

            if (addresseeId == Guid.Empty)
                throw new ArgumentException("AddresseeId is required.");

            if (requesterId == addresseeId)
                throw new ArgumentException("Cannot send a contact request to yourself.");

            Id = Guid.NewGuid();
            RequesterId = requesterId;
            AddresseeId = addresseeId;
            Status = ContactRequestStatus.Pending;
            CreatedAt = DateTime.UtcNow;
        }

        public Contact(Guid id, string name, string email, DateTime value)
        {
            Id = id;
            Name = name;
            Email = email;
            Value = value;
        }

        public Guid Id { get; private set; }
        public Guid RequesterId { get; private set; }
        public User? Requester { get; private set; }
        public Guid AddresseeId { get; private set; }
        public User? Addressee { get; private set; }
        public ContactRequestStatus Status { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? RespondedAt { get; private set; }
        public Guid Id1 { get; }
        public string Name { get; }
        public string Email { get; }
        public DateTime Value { get; }

        public void Accept()
        {
            if (Status != ContactRequestStatus.Pending)
                throw new InvalidOperationException("Only pending requests can be accepted.");

            Status = ContactRequestStatus.Accepted;
            RespondedAt = DateTime.UtcNow;
        }

        public void Reject()
        {
            if (Status != ContactRequestStatus.Pending)
                throw new InvalidOperationException("Only pending requests can be rejected.");

            Status = ContactRequestStatus.Rejected;
            RespondedAt = DateTime.UtcNow;
        }


    }
}
