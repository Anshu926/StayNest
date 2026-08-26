"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Send,
  Phone,
  MessageCircle,
  Clock,
  CheckCheck,
  Check,
  Loader2,
  Building,
  ChevronRight,
  Wifi,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
interface MessageItem {
  _id: string;
  senderRole: "customer" | "provider";
  senderName: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationInfo {
  _id: string;
  listingId: string;
  listingType: "stay" | "tiffin";
  listingName: string;
  listingImage?: string;
  listingArea?: string;
  listingSlug?: string;
  customerName: string;
  customerPhone: string;
  providerId?: string;
}

interface ChatBoxModalProps {
  conversationId: string;
  onClose: () => void;
  currentUserRole?: "customer" | "provider";
  currentUserName?: string;
}

/* ─── Quick reply banks ──────────────────────────────────────── */
const PROVIDER_REPLIES = [
  "Yes, it's available! When would you like to visit?",
  "Visits allowed: 10 AM – 7 PM, Mon–Sat.",
  "Deposit is 2 months rent, fully refundable.",
  "Wi-Fi & electricity included in monthly rent.",
  "Send me your preferred move-in date.",
];

const CUSTOMER_REPLIES = [
  "Is this available for immediate move-in?",
  "Can I schedule a visit tomorrow?",
  "Is food/laundry included in the rent?",
  "Is two-wheeler parking available?",
  "What is the exact deposit amount?",
];

/* ─── Helpers ────────────────────────────────────────────────── */
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateSeparator(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function groupByDate(messages: MessageItem[]) {
  const groups: Record<string, MessageItem[]> = {};
  for (const m of messages) {
    const label = formatDateSeparator(m.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(m);
  }
  return Object.entries(groups);
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function ChatBoxModal({
  conversationId,
  onClose,
  currentUserRole = "customer",
  currentUserName = "Me",
}: ChatBoxModalProps) {
  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // track IDs we have already so polling doesn't re-render duplicates
  const messageIdsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── scroll to latest message ─────────────────────────────── */
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  /* ── fetch & merge messages without duplicate flash ──────── */
  const fetchMessages = useCallback(async (initial = false) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!res.ok) return;
      const data = await res.json();

      const incoming: MessageItem[] = data.messages || [];
      const hasNew = incoming.some((m) => !messageIdsRef.current.has(m._id));

      if (hasNew || initial) {
        messageIdsRef.current = new Set(incoming.map((m) => m._id));
        setMessages(incoming);
        if (data.conversation) setConversation(data.conversation);
        if (initial) scrollToBottom(false);
        else scrollToBottom(true);
      }
    } catch {
      // silently ignore polling errors
    } finally {
      if (initial) setIsLoading(false);
    }
  }, [conversationId, scrollToBottom]);

  /* ── initial load + polling + mark-read ─────────────────── */
  useEffect(() => {
    fetchMessages(true);

    // mark as read
    const token = localStorage.getItem("token");
    fetch(`/api/conversations/${conversationId}/read`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {});

    // poll every 3 s
    pollingRef.current = setInterval(() => fetchMessages(false), 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [conversationId, fetchMessages]);

  /* ── Escape key closes modal ─────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ── auto-focus input ──────────────────────────────────────── */
  useEffect(() => {
    if (!isLoading) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isLoading]);

  /* ── Send message ────────────────────────────────────────── */
  const handleSend = useCallback(async (textOverride?: string) => {
    const text = (textOverride ?? inputText).trim();
    if (!text || isSending) return;

    setError("");
    setIsSending(true);
    if (!textOverride) setInputText("");

    // Optimistic message (temp id)
    const tempId = `temp-${Date.now()}`;
    const optimistic: MessageItem = {
      _id: tempId,
      senderRole: currentUserRole,
      senderName: currentUserName,
      text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text,
          senderRole: currentUserRole,
          senderName: currentUserName,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send");
      }

      // Replace optimistic with real (will come on next poll)
      await fetchMessages(false);
    } catch (err: any) {
      // Remove optimistic on error
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setError(err.message || "Failed to send message. Try again.");
      setInputText(text); // restore text
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, currentUserRole, currentUserName, conversationId, fetchMessages, scrollToBottom]);

  /* ── Computed values ─────────────────────────────────────── */
  const otherPersonName =
    currentUserRole === "provider"
      ? conversation?.customerName || "Customer"
      : "Property Provider";

  const customerPhone = conversation?.customerPhone;
  const whatsappUrl =
    customerPhone && customerPhone !== "Customer"
      ? `https://wa.me/91${customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
          `Hi${currentUserRole === "provider" ? " " + (conversation?.customerName || "") : ""}, I'm reaching out regarding "${conversation?.listingName || "NagpurNest"}" listed on NagpurNest.`
        )}`
      : null;

  const quickReplies = currentUserRole === "provider" ? PROVIDER_REPLIES : CUSTOMER_REPLIES;
  const grouped = groupByDate(messages);

  return (
    /* ── Backdrop ─────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Chat window ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
        style={{ height: "min(600px, 92vh)" }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          {/* Property thumbnail */}
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 flex-shrink-0 border border-gray-200 dark:border-slate-700">
            {conversation?.listingImage ? (
              <Image
                src={conversation.listingImage}
                alt={conversation.listingName || "Property"}
                fill
                className="object-cover"
                unoptimized={conversation.listingImage.startsWith("data:")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-500">
                <Building className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Name + status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                {otherPersonName}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800 flex-shrink-0">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
              {conversation?.listingName}
              {conversation?.listingArea ? ` · ${conversation.listingArea}` : ""}
            </p>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="p-2 rounded-xl text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {customerPhone && customerPhone !== "Customer" && (
              <a
                href={`tel:${customerPhone}`}
                title={`Call ${customerPhone}`}
                className="p-2 rounded-xl text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Message area ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50/60 dark:bg-slate-950/40">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <p className="text-xs">Loading conversation…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
              <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center text-primary-500">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm">
                  Start the conversation
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Use a quick reply or type your own message below.
                </p>
              </div>
            </div>
          ) : (
            grouped.map(([date, msgs]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 px-2">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                </div>

                {msgs.map((msg, idx) => {
                  const isMe = msg.senderRole === currentUserRole;
                  const isTemp = msg._id.startsWith("temp-");
                  const showAvatar =
                    !isMe &&
                    (idx === 0 || msgs[idx - 1]?.senderRole !== msg.senderRole);

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}
                    >
                      {/* Other person avatar */}
                      {!isMe && (
                        <div className={`w-7 h-7 rounded-full flex-shrink-0 mr-2 mt-1 ${showAvatar ? "visible" : "invisible"} bg-primary-100 dark:bg-slate-800 text-primary-700 dark:text-primary-400 font-bold text-xs flex items-center justify-center`}>
                          {msg.senderName?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}

                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[78%]`}>
                        {/* Sender name for first in group (other person only) */}
                        {!isMe && showAvatar && (
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 mb-0.5 ml-1">
                            {msg.senderName}
                          </span>
                        )}

                        {/* Bubble */}
                        <div
                          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                            isMe
                              ? "bg-primary-500 text-white rounded-tr-sm"
                              : "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-100 dark:border-slate-700 rounded-tl-sm shadow-sm"
                          } ${isTemp ? "opacity-70" : ""}`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>

                        {/* Timestamp + status */}
                        <div className={`flex items-center gap-1 mt-0.5 text-[10px] text-gray-400 dark:text-slate-500 ${isMe ? "flex-row-reverse" : ""}`}>
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMe && (
                            isTemp
                              ? <Clock className="w-3 h-3 opacity-50" />
                              : msg.isRead
                                ? <CheckCheck className="w-3 h-3 text-primary-400" />
                                : <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {/* Error toast */}
          {error && (
            <div className="flex justify-center mt-2">
              <span className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900">
                {error}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick replies ───────────────────────────────────── */}
        <div className="px-3 pt-2 pb-1 flex gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900 flex-shrink-0">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(reply)}
              disabled={isSending}
              className="text-[11px] flex-shrink-0 bg-gray-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/50 text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border border-transparent hover:border-primary-200 disabled:opacity-40"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* ── Input bar ──────────────────────────────────────── */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-3 flex items-end gap-2 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex-shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setError(""); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${otherPersonName}…`}
            className="flex-1 input-field text-sm py-2.5 rounded-2xl"
            disabled={isSending}
            maxLength={1000}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-10 h-10 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white flex items-center justify-center transition-all flex-shrink-0 shadow-md"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
