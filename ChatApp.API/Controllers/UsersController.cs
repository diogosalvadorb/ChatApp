using ChatApp.Application.DTOs;
using ChatApp.Domain.Entities;
using ChatApp.Domain.Ports.In;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace ChatApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserUseCases _userUseCases;
        public UsersController(IUserUseCases userUseCases)
        {
            _userUseCases = userUseCases;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            var user = await _userUseCases.RegisterAsync(request.Name, request.Email, request.Password);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, ToResponse(user));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserRequest request)
        {
            var token = await _userUseCases.LoginAsync(request.Email, request.Password);
            var userId = ReadSubFromToken(token);
            var user = await _userUseCases.GetByIdAsync(userId);
            return Ok(new AuthResponse(token, ToResponse(user)));
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userUseCases.GetByIdAsync(id);
            return Ok(ToResponse(user));
        }

        private static UserResponse ToResponse(User user)
        {
            return new UserResponse(user.Id, user.Name, user.Email, user.CreatedAt);
        }

        private static Guid ReadSubFromToken(string token)
        {
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
            return Guid.Parse(jwt.Claims.First(c => c.Type == "sub").Value);
        }
    }
}
