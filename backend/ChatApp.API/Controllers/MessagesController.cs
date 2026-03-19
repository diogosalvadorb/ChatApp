using ChatApp.Application.DTOs;
using ChatApp.Domain.Ports.In;
using ChatMVP.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageUseCases _messageUseCases;
        public MessagesController(IMessageUseCases messageUseCases)
        {
            _messageUseCases = messageUseCases;
        }

        [HttpPost]
        public async Task<IActionResult> Send([FromBody] SendMessageRequest request)
        {
            var senderId = MessageHelpers.GetCurrentUserId(User);
            var message = await _messageUseCases.SendAsync(senderId, request.RecipientId, request.Content);

            return Created(string.Empty, MessageHelpers.ToResponse(message));
        }

        [HttpGet("conversation/{otherId}")]
        public async Task<IActionResult> GetConversation(
            Guid otherId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var userId = MessageHelpers.GetCurrentUserId(User);
            var messages = await _messageUseCases.GetConversationAsync(userId, otherId, page, pageSize);

            return Ok(messages.Select(MessageHelpers.ToResponse));
        }

        [HttpPatch("{messageId}/read")]
        public async Task<IActionResult> MarkAsRead(Guid messageId)
        {
            await _messageUseCases.MarkAsReadAsync(messageId, MessageHelpers.GetCurrentUserId(User));

            return NoContent();
        }
    }
}
