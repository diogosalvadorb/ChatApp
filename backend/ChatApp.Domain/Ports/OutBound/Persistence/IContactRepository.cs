using ChatApp.Domain.Entities;

namespace ChatApp.Domain.Ports.Out.Persistence
{
    public interface IContactRepository
    {
        Task<Contact?> FindByIdAsync(Guid id);
        Task<Contact?> FindPendingBetweenAsync(Guid requesterId, Guid addresseeId);
        Task<bool> AreContactsAsync(Guid userA, Guid userB);
        Task<IEnumerable<Contact>> FindAcceptedByUserAsync(Guid userId);
        Task<IEnumerable<Contact>> FindPendingAddressedToAsync(Guid userId);
        Task UpdateAsync(Contact request);
        Task SaveAsync(Contact request);
    }
}