using ChatApp.Domain.Entities;

namespace ChatApp.Domain.Ports.Out.Persistence
{
    public interface IUserRepository
    {
        Task<User?> FindByIdAsync(Guid id);
        Task<User?> FindByEmailAsync(string email);
        Task<bool> ExistsByEmailAsync(string email);
        Task SaveAsync(User user);
    }
}
