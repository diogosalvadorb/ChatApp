using ChatApp.Domain.Entities;
using ChatApp.Domain.Ports.Out.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Infrastructure.Persistence.Repository
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataDbContext _context;
        public MessageRepository(DataDbContext context)
        {
            _context = context;
        }

        public async Task<Message?> FindByIdAsync(Guid id)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Recipient)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<IEnumerable<Message>> FindConversationAsync(Guid userId, Guid otherId, int page, int pageSize)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Recipient)
                .Where(m => 
                    (m.SenderId == userId && m.RecipientId == otherId) ||
                    (m.SenderId == otherId && m.RecipientId == userId))
                .OrderBy(m => m.SentAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task UpdateAsync(Message message)
        {
            _context.Messages.Update(message);
            await _context.SaveChangesAsync();
        }

        public async Task SaveAsync(Message message)
        {
            await _context.Messages.AddAsync(message);
            await _context.SaveChangesAsync();
        }
    }
}
