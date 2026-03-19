namespace ChatApp.Domain.Ports.Out.Services
{
    public interface IAuthService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hash);
        string GenerateToken(Guid userId, string email);
    }
}
