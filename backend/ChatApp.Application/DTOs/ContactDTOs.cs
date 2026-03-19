namespace ChatApp.Application.DTOs
{
    public class ContactDTOs
    {
        public sealed record SendContactRequestDto(string AddresseeEmail);

        public sealed record ContactRequestResponse(
            Guid Id,
            Guid RequesterId,
            string RequesterName,
            string RequesterEmail,
            Guid AddresseeId,
            string AddresseeName,
            string AddresseeEmail,
            string Status,
            DateTime CreatedAt,
            DateTime? RespondedAt);

        public sealed record ContactResponse(
            Guid UserId,
            string Name,
            string Email,
            DateTime ContactSince);

    }
}
