using ChatApp.Domain.Entities;
using ChatApp.Domain.Enum;
using ChatApp.Domain.Ports.Out.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Infrastructure.Persistence.Repository
{
    public class ContactRepository : IContactRepository
    {
        private readonly DataDbContext _context;
        public ContactRepository(DataDbContext context)
        {
            _context = context;
        }

        public async Task<Contact?> FindByIdAsync(Guid id)
        {
            return await _context.Contacts
                .Include(c => c.Requester)
                .Include(c => c.Addressee)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Contact?> FindPendingBetweenAsync(Guid requesterId, Guid addresseeId)
        {
            return await _context.Contacts
                .FirstOrDefaultAsync(c =>
                    c.Status == ContactRequestStatus.Pending &&
                    ((c.RequesterId == requesterId && c.AddresseeId == addresseeId) ||
                     (c.RequesterId == addresseeId && c.AddresseeId == requesterId)));
        }
            
        public async Task<bool> AreContactsAsync(Guid userA, Guid userB)
        {
            return await _context.Contacts
                .AnyAsync(c =>
                    c.Status == ContactRequestStatus.Accepted &&
                    ((c.RequesterId == userA && c.AddresseeId == userB) ||
                     (c.RequesterId == userB && c.AddresseeId == userA)));
        }
            
        public async Task<IEnumerable<Contact>> FindAcceptedByUserAsync(Guid userId)
        {
            return await _context.Contacts
                .Include(c => c.Requester)
                .Include(c => c.Addressee)
                .Where(c =>
                    c.Status == ContactRequestStatus.Accepted &&
                    (c.RequesterId == userId || c.AddresseeId == userId))
                .OrderBy(c => c.RespondedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Contact>> FindPendingAddressedToAsync(Guid userId)
        {
           return await _context.Contacts
                           .Include(c => c.Requester)
                           .Include(c => c.Addressee)
                           .Where(c =>
                               c.Status == ContactRequestStatus.Pending &&
                               c.AddresseeId == userId)
                           .OrderBy(c => c.CreatedAt)
                           .ToListAsync();
        }
           
        public async Task SaveAsync(Contact request)
        {
            await _context.Contacts.AddAsync(request);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Contact request)
        {
            _context.Contacts.Update(request);
            await _context.SaveChangesAsync();
        }
    }
}