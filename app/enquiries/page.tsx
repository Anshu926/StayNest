"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";

interface ThreadMessage {
  _id?: string;
  senderRole: "customer" | "provider" | "admin";
  senderName: string;
  text: string;
  createdAt: string;
}

interface EnquiryItem {
  _id: string;
  listingId: string;
  listingType: "stay" | "tiffin";
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: "pending" | "responded" | "resolved" | "closed";
  thread: ThreadMessage[];
  createdAt: string;
  updatedAt: string;
  listing: {
    name: string;
    images?: string[];
    area: string;
    slug: string;
    monthlyRent?: number;
    monthlyPrice?: number;
    propertyType?: string;
    foodType?: string;
  };
  provider: {
    name: string;
    phone: string;
    whatsapp?: string;
    businessName: string;
  };
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  pending: {
    label: "Pending Provider Reply",
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    icon: Clock,
  },
  responded: {
    label: "Provider Responded",
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

export default function CustomerEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, responded: 0, resolved: 0, closed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState("");

  const loadEnquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.set("role", "customer");
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("sort", selectedSort);

      const res = await fetch(`/api/inquiries?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        setEnquiries(json.data || []);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error("Error loading customer inquiries:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery, selectedSort]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

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
        // Update current selected modal inquiry thread
        if (json.data) {
          setSelectedEnquiry((prev) => (prev ? { ...prev, thread: json.data.thread, status: json.data.status } : null));
        }
        loadEnquiries();
      } else {
        const err = await res.json();
        setReplyError(err.error || "Failed to send message.");
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
      console.error("Status update error:", err);
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
                <MessageSquare className="w-3.5 h-3.5" />
                Customer Enquiries Portal
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                My Submitted Enquiries
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Track and manage all your booking requests, responses from PG/flat owners, and meal providers.
              </p>
            </div>

            <Link
              href="/stays"
              className="btn-primary text-xs px-4 py-2 self-start sm:self-center flex items-center gap-2 shadow-warm"
            >
              <span>Explore More Stays</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Total Submitted</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Awaiting Provider</p>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-blue-50/70 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-900/40">
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Responded</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300 mt-1">{stats.responded}</p>
            </div>
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Search & Status Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search property or provider..."
              className="input-field pl-10 text-xs sm:text-sm py-2.5"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
            {[
              { id: "all", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "responded", label: "Responded" },
              { id: "resolved", label: "Resolved" },
              { id: "closed", label: "Closed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStatus === tab.id
                    ? "bg-primary-500 text-white shadow-warm"
                    : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end md:self-center">
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

        {/* Inquiries List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500 dark:text-slate-400">Loading your enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="card p-10 sm:p-14 text-center max-w-lg mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/60 text-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-100 dark:border-primary-900/60">
              <MessageSquare className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-1.5">
              No enquiries found
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
              When you send an inquiry for a stay or tiffin service in Nagpur, it will be tracked here with full response history.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/stays" className="btn-primary text-xs px-5 py-2">
                Browse PGs & Stays
              </Link>
              <Link href="/tiffins" className="btn-secondary text-xs px-5 py-2">
                Browse Tiffins
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((inq) => {
              const statusInfo = statusConfig[inq.status] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;
              const listingPath = inq.listingType === "stay" ? `/stays/${inq.listing.slug}` : `/tiffins/${inq.listing.slug}`;
              const thumbnail = inq.listing.images?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=70";

              return (
                <div
                  key={inq._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-card border border-gray-100 dark:border-slate-800 transition-all hover:border-primary-200 dark:hover:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  {/* Left: Property & Message */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 flex-shrink-0">
                      <Image
                        src={thumbnail}
                        alt={inq.listing.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                          Submitted {new Date(inq.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                        <Link href={listingPath} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          {inq.listing.name}
                        </Link>
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-primary-500" />
                          {inq.listing.area}, Nagpur
                        </span>
                        <span>•</span>
                        <span className="capitalize font-semibold text-primary-600 dark:text-primary-400">
                          {inq.listingType}
                        </span>
                      </div>

                      {/* Initial / Latest message preview */}
                      <div className="mt-3 bg-gray-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 text-xs text-gray-700 dark:text-slate-300">
                        <p className="font-semibold text-gray-900 dark:text-white mb-0.5">Your enquiry message:</p>
                        <p className="line-clamp-2 italic">"{inq.message}"</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Provider Contact & Conversation Button */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100 dark:border-slate-800 flex-shrink-0">
                    <div className="text-left lg:text-right">
                      <p className="text-xs text-gray-400 dark:text-slate-500">Provider</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {inq.provider.businessName || inq.provider.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 justify-start lg:justify-end">
                        {inq.provider.phone && (
                          <a
                            href={`tel:${inq.provider.phone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            {inq.provider.phone}
                          </a>
                        )}
                        {inq.provider.whatsapp && (
                          <a
                            href={`https://wa.me/91${inq.provider.whatsapp.replace(/\D/g, '')}?text=Hi, I sent an enquiry for ${encodeURIComponent(inq.listing.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/60"
                          >
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedEnquiry(inq)}
                      className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-2 shadow-sm rounded-xl"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>View Conversation ({inq.thread?.length || 1})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conversation Thread Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800 animate-scale-in overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusConfig[selectedEnquiry.status]?.bg} ${statusConfig[selectedEnquiry.status]?.text} ${statusConfig[selectedEnquiry.status]?.border}`}>
                    {statusConfig[selectedEnquiry.status]?.label}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500">
                    ID: #{selectedEnquiry._id.slice(-6)}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
                  {selectedEnquiry.listing.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Messages Thread */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
              {selectedEnquiry.thread.map((msg, idx) => {
                const isCustomer = msg.senderRole === "customer";
                return (
                  <div
                    key={msg._id || idx}
                    className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                      <span>{isCustomer ? "You" : (selectedEnquiry.provider.businessName || "Provider")}</span>
                      <span>•</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isCustomer
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
                    placeholder="Type your message to the provider..."
                    className="input-field flex-1 text-xs sm:text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSendingReply || !replyText.trim()}
                    className="btn-primary px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    {isSendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send</span>
                  </button>
                </form>
              )}

              {/* Status Action Buttons */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-slate-800">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Status: {statusConfig[selectedEnquiry.status]?.label}</span>
                <div className="flex items-center gap-2">
                  {selectedEnquiry.status !== "resolved" && selectedEnquiry.status !== "closed" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedEnquiry._id, "resolved")}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Mark as Resolved ✓
                    </button>
                  )}
                  {selectedEnquiry.status !== "closed" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedEnquiry._id, "closed")}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                    >
                      Close Discussion
                    </button>
                  )}
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
