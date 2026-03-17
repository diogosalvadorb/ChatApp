namespace ChatApp.Application.DTOs
{
    public sealed record RegisterUserRequest(string Name, string Email, string Password);
    public sealed record LoginUserRequest(string Email, string Password);

    public sealed record UserResponse(Guid Id, string Name, string Email, DateTime CreatedAt);
    public sealed record AuthResponse(string Token, UserResponse User);
}
