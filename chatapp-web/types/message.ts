export interface MessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}