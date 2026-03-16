using ChatApp.Domain.Entities;

namespace ChatApp.Domain.Ports.In
{
    public interface IUserUseCases
    {
        Task<User> RegisterAsync(string name, string email, string password);
        Task<string> LoginAsync(string email, string password);
        Task<User> GetByIdAsync(Guid id);
    }
}
