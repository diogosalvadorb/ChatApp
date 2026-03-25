"use client";

import { Bell, Loader2, UserCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import { ContactRequestResponse } from "@/types/contact";
import { UserResponse } from "@/types/user";

interface ContactListProps {
  currentUserId: string;
}

export function ContactList({ currentUserId }: ContactListProps) {
  const [contacts, setContacts] = useState<UserResponse[]>([]);
  const [pendingRequests, setPendingRequests] = useState<
    ContactRequestResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [contactsData, pendingData] = await Promise.all([
        api.contacts.listContacts(),
        api.contacts.listContactPendingRequests(),
      ]);

      setContacts(contactsData);
      setPendingRequests(pendingData);
    } catch (err) {
      console.error("Erro ao carregar contatos", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAccept = async (requestId: string) => {
    try {
      setActionLoadingId(requestId);

      await api.contacts.acceptRequest(requestId);

      await fetchData();
    } catch (err) {
      console.error("Erro ao aceitar solicitação", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionLoadingId(requestId);

      await api.contacts.rejectRequest(requestId);

      await fetchData();
    } catch (err) {
      console.error("Erro ao recusar solicitação", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {pendingRequests.length > 0 && (
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowPending((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
          >
            <span className="flex items-center gap-2">
              <Bell size={14} />
              Solicitações pendentes
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
              {pendingRequests.length}
            </span>
          </button>
        </div>
      )}

      {showPending && pendingRequests.length > 0 && (
        <div className="mx-4 mb-3 overflow-hidden rounded-lg border border-amber-200 bg-amber-50/50">
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="flex flex-col gap-2 border-b border-amber-100 px-3 py-2.5 last:border-0"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-semibold text-amber-800">
                  {req.requesterName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-gray-800">
                    {req.requesterName}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {req.requesterEmail}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={actionLoadingId === req.id}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {actionLoadingId === req.id ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : null}
                  Aceitar
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  disabled={actionLoadingId === req.id}
                  className="flex flex-1 items-center justify-center rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <UserCheck size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Nenhum contato ainda</p>
            <p className="text-xs text-gray-400">
              Adicione contatos para começar a conversar
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <button
              key={contact.id}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {contact.name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {contact.email}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
