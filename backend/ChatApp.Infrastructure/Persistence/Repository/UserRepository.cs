using ChatApp.Domain.Entities;
using ChatApp.Domain.Ports.Out.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Infrastructure.Persistence.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly DataDbContext _context;
        public UserRepository(DataDbContext context)
        {
            _context = context;
        }

        public async Task<User?> FindByIdAsync(Guid id)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> FindByEmailAsync(string email)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task SaveAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }
    }
}
