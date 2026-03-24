import { ContactRequestResponse } from "@/types/contact";
import { MessageResponse } from "@/types/message";
import { UserResponse } from "@/types/user";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7037";

function getToken() {
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  auth: {
    register: (name: string, email: string, password: string) =>
      request<UserResponse>("/api/users/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }),

    login: (email: string, password: string) =>
      request<UserResponse>("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  },

  users: {
    getById: (id: string) => request<UserResponse>(`/api/users/${id}`),
    getByEmail: (email: string) =>
      request<UserResponse>(`/api/users/email/${email}`),
  },

  contacts: {
    sendRequest: (addresseeEmail: string) =>
      request<ContactRequestResponse>(`/api/contacts/request`, {
        method: "POST",
        body: JSON.stringify({ addresseeEmail }),
      }),
    acceptRequest: (requestId: string) =>
      request<ContactRequestResponse>(`/api/contacts/${requestId}/accept`, {
        method: "PATCH",
      }),
    rejectRequest: (requestId: string) =>
      request<ContactRequestResponse>(`/api/contacts/${requestId}/reject`, {
        method: "PATCH",
      }),
    listContacts: () => request<UserResponse[]>(`/api/contacts`),
    listContactPendingRequests: () =>
      request<ContactRequestResponse[]>("/api/contacts/pending"),
  },

  messages: {
    sendMessage: (recipientId: string, content: string) =>
      request<MessageResponse>(`/api/messages`, {
        method: "POST",
        body: JSON.stringify({ recipientId, content }),
      }),
    conversation: (otherId: string, page = 1, pageSize = 50) =>
      request<MessageResponse[]>(
        `/api/messages/conversation/${otherId}?page=${page}&pageSize=${pageSize}`,
      ),

    markRead: (messageId: string) =>
      request<void>(`/api/messages/${messageId}/read`, { method: "PATCH" }),
  },
};
