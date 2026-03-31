"use client";

import { Loader2, MessageSquare,Send } from "lucide-react";
import { useCallback,useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";
import { MessageResponse } from "@/types/message";
import { UserResponse } from "@/types/user";

interface ChatAreaProps {
  contact: UserResponse;
  currentUserId: string;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function groupMessagesByDate(messages: MessageResponse[]) {
  const groups: { date: string; messages: MessageResponse[] }[] = [];
  let lastDate = "";

  for (const msg of messages) {
    const dateLabel = formatDate(msg.sentAt);
    if (dateLabel !== lastDate) {
      groups.push({ date: dateLabel, messages: [] });
      lastDate = dateLabel;
    }
    groups[groups.length - 1].messages.push(msg);
  }
  return groups;
}

export function ChatArea({ contact, currentUserId }: ChatAreaProps) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await api.messages.conversation(contact.id);
      setMessages(data);
    } catch (err) {
      console.error("Erro ao buscar mensagens", err);
    }
  }, [contact.id]);

  // Mark unread messages as read
  const markUnread = useCallback(
    async (msgs: MessageResponse[]) => {
      const unread = msgs.filter(
        (m) => !m.isRead && m.recipientId === currentUserId,
      );
      await Promise.allSettled(
        unread.map((m) => api.messages.markRead(m.id)),
      );
    },
    [currentUserId],
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      try {
        const data = await api.messages.conversation(contact.id);
        if (!cancelled) {
          setMessages(data);
          await markUnread(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    // Poll every 3s
    pollingRef.current = setInterval(async () => {
      if (cancelled) return;
      try {
        const data = await api.messages.conversation(contact.id);
        if (!cancelled) {
          setMessages(data);
          await markUnread(data);
        }
      } catch {}
    }, 3000);

    return () => {
      cancelled = true;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [contact.id, fetchMessages, markUnread]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;

    setText("");
    setSending(true);

    // Optimistic update
    const optimistic: MessageResponse = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      senderName: "",
      recipientId: contact.id,
      recipientName: contact.name,
      content,
      sentAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await api.messages.sendMessage(contact.id, content);
      const data = await api.messages.conversation(contact.id);
      setMessages(data);
    } catch (err) {
      console.error("Erro ao enviar mensagem", err);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(content);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {contact.name}
          </p>
          <p className="truncate text-xs text-gray-400">{contact.email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 size={22} className="animate-spin text-blue-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <MessageSquare size={26} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Nenhuma mensagem ainda
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                Diga olá para {contact.name.split(" ")[0]}!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {grouped.map((group) => (
              <div key={group.date}>
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-400">
                    {group.date}
                  </span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                <div className="flex flex-col gap-1">
                  {group.messages.map((msg, idx) => {
                    const isMine = msg.senderId === currentUserId;
                    const isTemp = msg.id.startsWith("temp-");
                    const prevMsg = group.messages[idx - 1];
                    const sameSenderAsPrev =
                      prevMsg && prevMsg.senderId === msg.senderId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"} ${sameSenderAsPrev ? "mt-0.5" : "mt-2"}`}
                      >
                        {!isMine && (
                          <div className="mr-2 mt-auto flex w-7 shrink-0 items-end">
                            {!sameSenderAsPrev ? (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                                {contact.name.charAt(0).toUpperCase()}
                              </div>
                            ) : (
                              <div className="h-7 w-7" />
                            )}
                          </div>
                        )}

                        <div
                          className={`group flex max-w-[72%] flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`relative rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                              isMine
                                ? `bg-blue-600 text-white ${isTemp ? "opacity-70" : ""} ${sameSenderAsPrev ? "rounded-tr-md" : ""}`
                                : `bg-gray-100 text-gray-800 ${sameSenderAsPrev ? "rounded-tl-md" : ""}`
                            }`}
                          >
                            {msg.content}
                          </div>
                          <div className="flex items-center gap-1 px-1">
                            <span className="text-[10px] text-gray-400">
                              {formatTime(msg.sentAt)}
                            </span>
                            {isMine && !isTemp && (
                              <span
                                className={`text-[10px] ${msg.isRead ? "text-blue-400" : "text-gray-300"}`}
                              >
                                {msg.isRead ? "✓✓" : "✓"}
                              </span>
                            )}
                            {isMine && isTemp && (
                              <Loader2
                                size={9}
                                className="animate-spin text-gray-300"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 bg-white px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={`Mensagem para ${contact.name.split(" ")[0]}…`}
            rows={1}
            disabled={sending}
            className="max-h-28 flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
            style={{ height: "auto" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
          >
            {sending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-gray-300">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
