namespace ChatApp.Application.DTOs
{
    public sealed record SendMessageRequest(Guid RecipientId, string Content);

    public sealed record MessageResponse(
    Guid Id,
    Guid SenderId,
    string SenderName,
    Guid RecipientId,
    string RecipientName,
    string Content,
    DateTime SentAt,
    bool IsRead);

}
