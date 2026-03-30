using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ChatApp.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier);

            if (userId != null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId.Value);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier);

            if (userId != null)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.Value);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
