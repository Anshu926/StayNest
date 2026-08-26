"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Phone,
  Send,
  Loader2,
  ExternalLink,
  ChevronRight,
  User,
  Building,
  MapPin,
  X,
  MessageCircle,
  RefreshCw,
  LayoutDashboard,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface ThreadMessage {
  _id?: string;
  senderRole: "customer" | "provider" | "admin";
  senderName: string;
  text: string;
  createdAt: string;
}

interface ProviderEnquiryItem {
  _id: string;
  listingId: string;
  listingType: "stay" | "tiffin";
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: "pending" | "responded" | "resolved" | "closed";
  thread: ThreadMessage[];
  isReadByProvider: boolean;
  createdAt: string;
  updatedAt: string;
  listing: {
    name: string;
    images?: string[];
    area: string;
    slug: string;
    monthlyRent?: number;
    monthlyPrice?: number;
  };
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  pending: {
    label: "Pending Response",
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    icon: Clock,
  },
  responded: {
    label: "Responded",
    bg: "bg-blue-50 dark:bg-blue-950/60",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    icon: MessageSquare,
  },
  resolved: {
    label: "Resolved",
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700",
    icon: XCircle,
  },
};

export default function ProviderEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ProviderEnquiryItem[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, responded: 0, resolved: 0, closed: 0, unread: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedListing, setSelectedListing] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedEnquiry, setSelectedEnquiry] = useState<ProviderEnquiryItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const loadEnquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams();
      params.set("role", "provider");
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (selectedListing !== "all") params.set("listingId", selectedListing);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("sort", selectedSort);

      const res = await fetch(`/api/inquiries?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        setEnquiries(json.data || []);
        if (json.stats) setStats(json.stats);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Error loading provider inquiries:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, selectedListing, searchQuery, selectedSort, router]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  // Unique listings for dropdown filter
  const uniqueListings = Array.from(
    new Map(
      enquiries.map((i) => [i.listingId, { id: i.listingId, name: i.listing.name }])
    ).values()
  );

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !replyText.trim()) return;

    setIsSendingReply(true);
    setReplyError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/inquiries/${selectedEnquiry._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: replyText.trim() }),
      });

      if (res.ok) {
        const json = await res.json();
        setReplyText("");
        if (json.data) {
          setSelectedEnquiry((prev) => (prev ? { ...prev, thread: json.data.thread, status: json.data.status } : null));
        }
        loadEnquiries();
      } else {
        const err = await res.json();
        setReplyError(err.error || "Failed to send reply.");
      }
    } catch {
      setReplyError("Network error. Please try again.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateStatus = async (enquiryId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/inquiries/${enquiryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
          setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
        loadEnquiries();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteEnquiry = async (enquiryId: string) => {
    if (!confirm("Are you sure you want to delete this enquiry? This cannot be undone.")) return;

    // Optimistic removal — remove from UI immediately
    setDeletingId(enquiryId);
    setEnquiries((prev) => prev.filter((e) => e._id !== enquiryId));
    if (selectedEnquiry?._id === enquiryId) setSelectedEnquiry(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/inquiries/${enquiryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // Revert: re-fetch if delete failed
        loadEnquiries();
      }
    } catch {
      // Revert on network error
      loadEnquiries();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full border border-primary-200/80 dark:border-primary-900/60 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Provider Lead Management
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Received Tenant & Meal Enquiries
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                View, reply, and update the status of potential tenant leads and customer questions in real time.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={loadEnquiries}
                className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
                title="Refresh leads"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              <Link
                href="/provider/dashboard"
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-warm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Action Needed (Pending)</p>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-blue-50/70 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-900/40">
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Responded</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300 mt-1">{stats.responded}</p>
            </div>
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Resolved & Booked</p>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content & Filtering */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone, message..."
              className="input-field pl-10 text-xs py-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field text-xs py-1.5 px-3 rounded-xl"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="responded">Responded ({stats.responded})</option>
                <option value="resolved">Resolved ({stats.resolved})</option>
                <option value="closed">Closed ({stats.closed})</option>
              </select>
            </div>

            {/* Listing Filter */}
            {uniqueListings.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Listing:</span>
                <select
                  value={selectedListing}
                  onChange={(e) => setSelectedListing(e.target.value)}
                  className="input-field text-xs py-1.5 px-3 rounded-xl max-w-[160px]"
                >
                  <option value="all">All Listings</option>
                  {uniqueListings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="input-field text-xs py-1.5 px-3 rounded-xl"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lead Table / Cards */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500 dark:text-slate-400">Loading received enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="card p-12 text-center max-w-md mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/60 text-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-100 dark:border-primary-900/60">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white mb-1">
              No enquiries match your filter
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              All incoming inquiries from prospective tenants or tiffin subscribers will appear here.
            </p>
            <button
              onClick={() => { setSelectedStatus("all"); setSearchQuery(""); setSelectedListing("all"); }}
              className="btn-secondary text-xs px-4 py-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((inq) => {
              const statusInfo = statusConfig[inq.status] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;
              const thumbnail = inq.listing.images?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=70";

              return (
                <div
                  key={inq._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-card border border-gray-100 dark:border-slate-800 transition-all hover:border-primary-200 dark:hover:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  {/* Left: Customer info & Message */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center font-bold text-base flex-shrink-0">
                      {inq.name ? inq.name.charAt(0).toUpperCase() : "C"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 dark:text-white text-base">
                          {inq.name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">•</span>
                        <a
                          href={`tel:${inq.phone}`}
                          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {inq.phone}
                        </a>
                        <a
                          href={`https://wa.me/91${inq.phone.replace(/\D/g, '')}?text=Hi ${encodeURIComponent(inq.name)}, regarding your enquiry for ${encodeURIComponent(inq.listing.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/60"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp
                        </a>
                      </div>

                      {/* Property Badge */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-1">
                        <span className="font-semibold text-gray-700 dark:text-slate-300">
                          Listing: {inq.listing.name}
                        </span>
                        <span>•</span>
                        <span>{new Date(inq.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>

                      {/* Message preview */}
                      <div className="mt-3 bg-gray-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 text-xs text-gray-700 dark:text-slate-300">
                        <p className="line-clamp-2">"{inq.message}"</p>
                      </div>
                    </div>
                  </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100 dark:border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">Status:</span>
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateStatus(inq._id, e.target.value)}
                        className={`text-xs font-bold py-1.5 px-3 rounded-xl border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} focus:ring-0 cursor-pointer`}
                      >
                        <option value="pending">Pending</option>
                        <option value="responded">Responded</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedEnquiry(inq)}
                        className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-2 shadow-sm rounded-xl flex-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Reply & View Thread ({inq.thread?.length || 1})</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEnquiry(inq._id)}
                        disabled={deletingId === inq._id}
                        title="Delete this enquiry"
                        className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        {deletingId === inq._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Provider Reply & History Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800 animate-scale-in overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 dark:text-white text-base">
                    Lead: {selectedEnquiry.name} ({selectedEnquiry.phone})
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  Property: {selectedEnquiry.listing.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteEnquiry(selectedEnquiry._id)}
                  disabled={deletingId === selectedEnquiry._id}
                  title="Delete this enquiry"
                  className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 flex items-center justify-center transition-colors border border-red-200 dark:border-red-900/60"
                >
                  {deletingId === selectedEnquiry._id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
              {selectedEnquiry.thread.map((msg, idx) => {
                const isProvider = msg.senderRole === "provider";
                return (
                  <div
                    key={msg._id || idx}
                    className={`flex flex-col ${isProvider ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                      <span>{isProvider ? "You (Provider)" : selectedEnquiry.name}</span>
                      <span>•</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isProvider
                          ? "bg-primary-600 text-white rounded-br-none"
                          : "bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-100 dark:border-slate-700 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer / Reply Form */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              {replyError && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {replyError}
                </p>
              )}

              {selectedEnquiry.status === "closed" ? (
                <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs text-center rounded-xl">
                  This enquiry discussion has been closed.
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response to the customer..."
                    className="input-field flex-1 text-xs sm:text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSendingReply || !replyText.trim()}
                    className="btn-primary px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    {isSendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Reply</span>
                  </button>
                </form>
              )}

              {/* Status Action Buttons */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-slate-800">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Update Status:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedEnquiry._id, "responded")}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-semibold"
                  >
                    Responded
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedEnquiry._id, "resolved")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold"
                  >
                    Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedEnquiry._id, "closed")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold"
                  >
                    Closed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
