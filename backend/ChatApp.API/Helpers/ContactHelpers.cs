using ChatApp.Domain.Entities;
using System.Security.Claims;
using static ChatApp.Application.DTOs.ContactDTOs;

namespace ChatApp.API.Helpers
{
    internal static class ContactHelpers
    {
        internal static ContactRequestResponse ToResponse(Contact r) =>
            new(
                r.Id,
                r.RequesterId,
                r.Requester?.Name ?? string.Empty,
                r.Requester?.Email ?? string.Empty,
                r.AddresseeId,
                r.Addressee?.Name ?? string.Empty,
                r.Addressee?.Email ?? string.Empty,
                r.Status.ToString(),
                r.CreatedAt,
                r.RespondedAt);

        internal static Guid GetCurrentUserId(ClaimsPrincipal user) =>
            Guid.Parse(
                user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue("sub")
                ?? throw new UnauthorizedAccessException());
    }
}