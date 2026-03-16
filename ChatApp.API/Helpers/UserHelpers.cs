using ChatApp.Application.DTOs;
using ChatApp.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;

namespace ChatApp.API.Helpers
{
    internal static class UserHelpers
    {
        internal static UserResponse ToResponse(User user) =>
            new(user.Id, user.Name, user.Email, user.CreatedAt);

        internal static Guid ReadSubFromToken(string token)
        {
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
            return Guid.Parse(jwt.Claims.First(c => c.Type == "sub").Value);
        }
    }
}