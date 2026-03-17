using ChatApp.Application.Exceptions;
using ChatApp.Domain.Entities;
using ChatApp.Domain.Ports.In;
using ChatApp.Domain.Ports.Out.Persistence;
using ChatApp.Domain.Ports.Out.Services;

namespace ChatApp.Application.UseCases.Users
{
    public class UserUseCases : IUserUseCases
    {
        private readonly IUserRepository _userRepository;
        private readonly IAuthService _authService;
        public UserUseCases(IUserRepository userRepository, IAuthService authService)
        {
            _userRepository = userRepository;
            _authService = authService;
        }

        public async Task<User> RegisterAsync(string name, string email, string password)
        {
            if (await _userRepository.ExistsByEmailAsync(email))
                throw new ConflictException($"Email '{email}' is already in use.");

            var passwordHash = _authService.HashPassword(password);
            var user = new User(name, email, passwordHash);

            await _userRepository.SaveAsync(user);

            return user;
        }

        public async Task<string> LoginAsync(string email, string password)
        {
            var user = await _userRepository.FindByEmailAsync(email)
            ?? throw new UnauthorizedException("Invalid email or password.");

            if (!_authService.VerifyPassword(password, user.PasswordHash))
                throw new UnauthorizedException("Invalid email or password.");

            return _authService.GenerateToken(user.Id, user.Email);
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _userRepository.FindByEmailAsync(email)
                ?? throw new NotFoundException(nameof(User), email);
        }

        public async Task<User> GetByIdAsync(Guid id)
        {
            return await _userRepository.FindByIdAsync(id)
            ?? throw new NotFoundException(nameof(User), id);
        }
    }
}
