"use client";

import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { UserResponse } from "@/types/user";

import { AddContactModal } from "./components/add-contact-modal";
import { ChatArea } from "./components/chat-area";
import { ContactList } from "./components/contact-list";

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<UserResponse | null>(
    null,
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      router.push("/authentication");
      return;
    }

    setCurrentUser(JSON.parse(user));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/authentication");
  };

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="flex w-80 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <MessageSquare size={16} className="text-white" />
            </div>
            <span className="text-base font-semibold text-gray-900">
              ChatApp
            </span>
          </div>
        </div>

        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {currentUser.name}
              </p>
              <p className="truncate text-xs text-gray-500">
                {currentUser.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Contatos
            </span>
            <button
              onClick={() => setIsAddContactOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              Adicionar
            </button>
          </div>

          <ContactList
            currentUserId={currentUser.id}
            selectedContactId={selectedContact?.id}
            onSelectContact={setSelectedContact}
          />
        </div>

        <div className="border-t border-gray-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            Sair da conta
          </button>
        </div>
      </aside>

      <main className="flex flex-1 overflow-hidden">
        {selectedContact ? (
          <div className="flex h-full w-full flex-col overflow-hidden">
            <ChatArea
              contact={selectedContact}
              currentUserId={currentUser.id}
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gray-50 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
              <MessageSquare size={32} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Selecione um contato para conversar
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Escolha um contato na lista ao lado para iniciar uma conversa
              </p>
            </div>
          </div>
        )}
      </main>

      {isAddContactOpen && (
        <AddContactModal onClose={() => setIsAddContactOpen(false)} />
      )}
    </div>
  );
}
