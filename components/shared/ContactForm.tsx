"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, MessageSquare, Loader2, X, ShieldCheck, LayoutDashboard, Edit } from "lucide-react";
import Link from "next/link";
import ChatBoxModal from "@/components/chat/ChatBoxModal";

interface ContactFormProps {
  listingId: string;
  listingType: "stay" | "tiffin";
  providerId?: string;
}

export default function ContactForm({ listingId, listingType, providerId }: ContactFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Auth / Owner state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setCurrentUserId(u._id || u.id || null);
        if (u.name) setName(u.name);
      }
    } catch {}
  }, []);

  const isOwner = Boolean(
    currentUserId && providerId && currentUserId.toString() === providerId.toString()
  );

  // "Live Chat" quick-open: validate name+phone first, then open chat
  const [chatPrompt, setChatPrompt] = useState(false);
  const [chatName, setChatName] = useState("");
  const [chatPhone, setChatPhone] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  /* ── Owner View ───────────────────────────────────────────── */
  if (isOwner) {
    return (
      <div className="p-5 bg-primary-50/60 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/60 rounded-2xl text-center space-y-3">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/80 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-sm">Your Listing</h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
            You are the owner of this {listingType === "stay" ? "stay" : "tiffin service"}. All tenant inquiries and chat messages will appear in your Provider Dashboard.
          </p>
        </div>
        <div className="pt-1 flex flex-col gap-2">
          <Link
            href={`/provider/listings/${listingId}/edit`}
            className="btn-primary text-xs py-2 px-4 w-full flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit This Listing
          </Link>
          <Link
            href="/provider/dashboard"
            className="btn-secondary text-xs py-2 px-4 w-full flex items-center justify-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            View Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* ── Submit inquiry form ──────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ listingId, listingType, name, phone, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        if (data.conversationId) setActiveConversationId(data.conversationId);
      } else {
        setError(data.error || "Failed to send inquiry. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Open Live Chat (needs name + phone) ──────────────────── */
  const handleOpenLiveChat = async () => {
    setChatError("");
    const n = chatName.trim() || name.trim();
    const p = chatPhone.trim() || phone.trim();

    if (!n) { setChatError("Please enter your name."); return; }
    if (!p || !/^[6-9]\d{9}$/.test(p)) { setChatError("Enter a valid 10-digit mobile number."); return; }

    setChatLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ listingId, listingType, customerName: n, customerPhone: p }),
      });
      const data = await res.json();
      if (data?.data?._id) {
        setActiveConversationId(data.data._id);
        setChatPrompt(false);
        setShowChatModal(true);
      } else {
        setChatError(data?.error || "Could not start chat. Try again.");
      }
    } catch {
      setChatError("Network error.");
    } finally {
      setChatLoading(false);
    }
  };

  /* ── Success state ─────────────────────────────────────────── */
  if (success) {
    return (
      <>
        <div className="text-center py-5 bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-2xl p-5 animate-fade-in">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
            Inquiry Sent!
          </h3>
          <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
            The provider has received your message and will contact you shortly on&nbsp;
            <strong>{phone}</strong>.
          </p>

          {activeConversationId && (
            <button
              type="button"
              onClick={() => setShowChatModal(true)}
              className="w-full btn-primary text-sm py-2.5 px-4 mb-3 flex items-center justify-center gap-2 shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              Continue Conversation
            </button>
          )}

          <button
            onClick={() => { setSuccess(false); setName(""); setPhone(""); setMessage(""); }}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-slate-300 underline"
          >
            Send another inquiry
          </button>
        </div>

        {showChatModal && activeConversationId && (
          <ChatBoxModal
            conversationId={activeConversationId}
            onClose={() => setShowChatModal(false)}
            currentUserRole="customer"
            currentUserName={name || "Customer"}
          />
        )}
      </>
    );
  }

  /* ── Live Chat mini-prompt overlay ─────────────────────────── */
  if (chatPrompt) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-primary-500" />
            Start Live Chat
          </h3>
          <button
            type="button"
            onClick={() => { setChatPrompt(false); setChatError(""); }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Enter your details so the provider knows who you are.
        </p>
        <input
          type="text"
          placeholder="Your name"
          value={chatName || name}
          onChange={(e) => setChatName(e.target.value)}
          className="input-field text-sm"
          maxLength={80}
        />
        <input
          type="tel"
          placeholder="Your 10-digit mobile number"
          value={chatPhone || phone}
          onChange={(e) => setChatPhone(e.target.value)}
          className="input-field text-sm"
          maxLength={10}
        />
        {chatError && <p className="text-xs text-red-500 font-medium">{chatError}</p>}
        <button
          type="button"
          onClick={handleOpenLiveChat}
          disabled={chatLoading}
          className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
        >
          {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
          {chatLoading ? "Opening…" : "Open Live Chat"}
        </button>
      </div>
    );
  }

  /* ── Main inquiry form ─────────────────────────────────────── */
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            Contact Provider
          </h3>
          <button
            type="button"
            onClick={() => setChatPrompt(true)}
            className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Live Chat
          </button>
        </div>

        <input
          type="text"
          placeholder="Your name"
          className="input-field text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          suppressHydrationWarning
        />
        <input
          type="tel"
          placeholder="Your 10-digit mobile number"
          className="input-field text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={10}
          suppressHydrationWarning
        />
        <textarea
          placeholder="Ask a question (e.g. Is this available? Can I visit?)"
          className="input-field text-sm resize-none h-20"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          suppressHydrationWarning
        />

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
          suppressHydrationWarning
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Sending…" : "Send Inquiry"}
        </button>
      </form>

      {showChatModal && activeConversationId && (
        <ChatBoxModal
          conversationId={activeConversationId}
          onClose={() => setShowChatModal(false)}
          currentUserRole="customer"
          currentUserName={name || chatName || "Customer"}
        />
      )}
    </>
  );
}
