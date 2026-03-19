export interface ContactResponse {
  userId: string;
  name: string;
  email: string;
  contactSince: string;
}

export interface ContactRequestResponse {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  addresseeId: string;
  addresseeName: string;
  addresseeEmail: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  respondedAt: string | null;
}