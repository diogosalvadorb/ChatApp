using ChatApp.API.Hubs;
using ChatApp.Application.DTOs;
using ChatApp.Domain.Ports.In;
using ChatMVP.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageUseCases _messageUseCases;
        private readonly IHubContext<ChatHub> _hubContext;
        public MessagesController(IMessageUseCases messageUseCases, IHubContext<ChatHub> hubContext)
        {
            _messageUseCases = messageUseCases;
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> Send([FromBody] SendMessageRequest request)
        {
            var senderId = MessageHelpers.GetCurrentUserId(User);

            var message = await _messageUseCases.SendAsync(senderId, request.RecipientId, request.Content);

            var response = MessageHelpers.ToResponse(message);
            
            await _hubContext.Clients
                .Group(request.RecipientId.ToString())
                .SendAsync("ReceiveMessage", response);

            await _hubContext.Clients
                .Group(senderId.ToString())
                .SendAsync("ReceiveMessage", response);

            return Created(string.Empty, response);
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
            var userId = MessageHelpers.GetCurrentUserId(User);

            await _messageUseCases.MarkAsReadAsync(messageId, userId);

            await _hubContext.Clients
                .Group(userId.ToString())
                .SendAsync("MessageRead", messageId);

            return NoContent();
        }
    }
}
