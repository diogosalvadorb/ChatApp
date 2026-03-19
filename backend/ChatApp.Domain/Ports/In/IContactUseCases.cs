using ChatApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
namespace ChatApp.Domain.Ports.In
{
    public interface IContactUseCases
    {
        Task<Contact> SendRequestAsync(Guid requesterId, string addresseeEmail);
        Task<Contact> AcceptRequestAsync(Guid requestId, Guid addresseeId);
        Task<Contact> RejectRequestAsync(Guid requestId, Guid addresseeId);
        Task<IEnumerable<Contact>> GetContactsAsync(Guid userId);
        Task<IEnumerable<Contact>> GetPendingRequestsAsync(Guid userId);
    }
}
