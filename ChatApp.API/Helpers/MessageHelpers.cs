using ChatApp.Application.DTOs;
using ChatApp.Domain.Entities;
using System.Security.Claims;

namespace ChatMVP.API.Helpers
{
    internal static class MessageHelpers
    {
        internal static MessageResponse ToResponse(Message m) =>
            new(
                m.Id,
                m.SenderId,
                m.Sender?.Name ?? string.Empty,
                m.RecipientId,
                m.Recipient?.Name ?? string.Empty,
                m.Content,
                m.SentAt,
                m.IsRead);

        internal static Guid GetCurrentUserId(ClaimsPrincipal user) =>
            Guid.Parse(
                user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue("sub")
                ?? throw new UnauthorizedAccessException());
    }
}