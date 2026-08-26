"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LogOut,
  Home,
  Plus,
  BarChart3,
  Settings,
  MapPin,
  ExternalLink,
  Edit,
  Trash2,
  Layers,
  Loader2,
  AlertCircle,
  MessageSquare,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  Mail,
  User,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatBoxModal from "@/components/chat/ChatBoxModal";
import { formatPrice } from "@/lib/utils";

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

interface ListingItem {
  _id: string;
  name: string;
  slug: string;
  area: string;
  monthlyRent?: number;
  monthlyPrice?: number;
  propertyType?: string;
  foodType?: string;
  images: string[];
  status: string;
  createdAt: string;
}

interface InquiryItem {
  _id: string;
  listingId: string;
  listingType: "stay" | "tiffin";
  name: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  conversationId?: string | null;
  listing?: {
    name: string;
    images?: string[];
    area?: string;
    slug?: string;
    monthlyRent?: number;
    monthlyPrice?: number;
  };
}

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "inquiries">("listings");

  // Listings state
  const [stays, setStays] = useState<ListingItem[]>([]);
  const [tiffins, setTiffins] = useState<ListingItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Inquiries state
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Deletion modal state
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchDashboardData = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // 1. Fetch Listings
    fetch("/api/listings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setStays(data.data.stays || []);
          setTiffins(data.data.tiffins || []);
          setTotalCount(data.data.total || 0);
        }
      })
      .catch((e) => console.error(e));

    // 2. Fetch Inquiries
    fetch("/api/inquiries", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setInquiries(data.data || []);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        setUser({ name: "Provider", email: "", role: "provider" });
      }
    } catch {}

    fetchDashboardData();

    // Auto-poll every 10 seconds for new customer inquiries
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [router, fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/listings/${itemToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || "Failed to delete listing");
      }

      setStays((prev) => prev.filter((s) => s._id !== itemToDelete.id));
      setTiffins((prev) => prev.filter((t) => t._id !== itemToDelete.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setItemToDelete(null);
    } catch (err: any) {
      setDeleteError(err.message || "Could not delete listing.");
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteInquiry = async (inqId: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    // Optimistic removal — remove from UI immediately before API call
    setInquiries((prev) => prev.filter((i) => i._id !== inqId));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/inquiries/${inqId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // Revert by re-fetching if server delete failed
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
      fetchDashboardData();
    }
  };

  const openChatForInquiry = async (inq: InquiryItem) => {
    // Mark inquiry as read optimistically
    setInquiries((prev) =>
      prev.map((i) => (i._id === inq._id ? { ...i, isRead: true } : i))
    );
    setUnreadCount((prev) => Math.max(0, prev - (inq.isRead ? 0 : 1)));

    if (inq.conversationId) {
      setSelectedConversationId(inq.conversationId);
    } else {
      // Create a conversation thread linked to this inquiry
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            listingId: inq.listingId,
            listingType: inq.listingType,
            customerName: inq.name,
            customerPhone: inq.phone,
          }),
        });
        const data = await res.json();
        if (data?.data?._id) {
          setSelectedConversationId(data.data._id);
          // Update inquiry with conversationId locally
          setInquiries((prev) =>
            prev.map((i) =>
              i._id === inq._id ? { ...i, conversationId: data.data._id } : i
            )
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
  };


  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-slate-400">Loading your provider dashboard...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const allListings = [
    ...stays.map((s) => ({ ...s, isTiffin: false })),
    ...tiffins.map((t) => ({ ...t, isTiffin: true })),
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50/60 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded-full border border-primary-100 dark:border-primary-900 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Provider Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome Back, {user?.name || "Provider"}!
              </h1>
              <p className="text-gray-600 dark:text-slate-400 text-sm mt-0.5">
                Manage your listings, respond to customer inquiries, and chat in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/provider/listings/new"
                className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add New Listing
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card p-5 border-l-4 border-primary-500 border border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                    Total Active Listings
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalCount}</p>
                </div>
                <Home className="w-8 h-8 text-primary-500/30" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab("inquiries")}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-card p-5 border-l-4 border-green-500 border border-gray-100 dark:border-slate-800 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                    Customer Inquiries & Chats
                    {unreadCount > 0 && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    )}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {inquiries.length}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-500/30" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card p-5 border-l-4 border-amber-500 border border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                    Unread Inquiries
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {unreadCount}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-500/30" />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab("listings")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === "listings"
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Published Listings</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "listings" ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
              }`}>
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("inquiries")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all relative ${
                activeTab === "inquiries"
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Customer Inquiries & Live Chat</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "inquiries" ? "bg-white/20 text-white" : "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 font-bold"
              }`}>
                {inquiries.length}
              </span>
            </button>
          </div>

          {/* TAB 1: LISTINGS MANAGEMENT */}
          {activeTab === "listings" && (
            <div className="space-y-6">
              {/* Quick Action Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/provider/listings/new"
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-card hover:shadow-lg p-5 border-2 border-dashed border-primary-300 dark:border-primary-800 flex items-center gap-4 transition-all group hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/60 rounded-xl flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white text-primary-600 dark:text-primary-400 transition-colors flex-shrink-0">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Add New Listing with 4 Photos</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Publish a new PG, room, flat, or tiffin service in Nagpur.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/provider/settings"
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-card hover:shadow-lg p-5 border border-gray-200 dark:border-slate-800 flex items-center gap-4 transition-all group hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-gray-600 dark:text-slate-300 group-hover:bg-gray-200 dark:group-hover:bg-slate-700 transition-colors flex-shrink-0">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Provider Business Profile</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Update your contact number, WhatsApp, and verification status.
                    </p>
                  </div>
                </Link>
              </div>

              {/* Listings List */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Manage Your Properties</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Edit details, update 4 photos, or delete properties</p>
                  </div>
                  <span className="text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2.5 py-1 rounded-full">
                    {allListings.length} listings
                  </span>
                </div>

                {allListings.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Layers className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No listings created yet</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                      Create your first PG, Flat, or Tiffin listing with 4 high-quality photos!
                    </p>
                    <Link
                      href="/provider/listings/new"
                      className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create First Listing
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {allListings.map((item) => {
                      const image = item.images?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=70";
                      const viewHref = item.isTiffin ? `/tiffins/${item.slug}` : `/stays/${item.slug}`;
                      const price = item.isTiffin ? item.monthlyPrice : item.monthlyRent;

                      return (
                        <div
                          key={item._id}
                          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 flex-shrink-0 border border-gray-200 dark:border-slate-700">
                              <Image
                                src={image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                unoptimized={image.startsWith("data:")}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-900">
                                  {item.isTiffin ? "Tiffin" : item.propertyType || "Stay"}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                  {item.status || "Active"}
                                </span>
                              </div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-base">{item.name}</h3>
                              <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {item.area}, Nagpur
                              </p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                {formatPrice(price || 0)}
                                <span className="text-xs font-normal text-gray-400 ml-1">/month</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <Link
                              href={viewHref}
                              target="_blank"
                              className="px-3 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-gray-200 dark:border-slate-700"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View
                            </Link>

                            <Link
                              href={`/provider/listings/${item._id}/edit`}
                              className="px-3.5 py-2 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 text-primary-700 dark:text-primary-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-primary-200 dark:border-primary-900"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => setItemToDelete({ id: item._id, name: item.name })}
                              className="px-3 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-200 dark:border-red-900"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INQUIRIES & LIVE CHAT INBOX */}
          {activeTab === "inquiries" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary-500" />
                      Incoming Customer Inquiries ({inquiries.length})
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Real-time inquiries received for your Nagpur properties and tiffin services
                    </p>
                  </div>
                  <button
                    onClick={fetchDashboardData}
                    className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                  >
                    Refresh Inbox
                  </button>
                </div>

                {inquiries.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      No inquiries yet
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                      When prospective tenants or food customers contact you through your listings, their messages and phone numbers will appear here!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {inquiries.map((inq) => {
                      const propImage =
                        inq.listing?.images?.[0] ||
                        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=70";
                      const cleanPhone = inq.phone.replace(/\D/g, "");
                      const whatsappLink = `https://wa.me/91${cleanPhone}?text=Hi ${encodeURIComponent(
                        inq.name
                      )}, thank you for inquiring about "${encodeURIComponent(
                        inq.listing?.name || "our property"
                      )}" on StayNest...`;

                      return (
                        <div
                          key={inq._id}
                          className={`p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                            !inq.isRead
                              ? "bg-primary-50/40 dark:bg-primary-950/20 border-l-4 border-primary-400 hover:bg-primary-50/60"
                              : "hover:bg-gray-50/50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          {/* Left: Customer + Message + Property info */}
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 font-bold text-lg flex items-center justify-center shadow-sm">
                                {inq.name?.[0]?.toUpperCase() || "C"}
                              </div>
                              {!inq.isRead && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                  <span className="text-white text-[8px] font-bold">!</span>
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                  {inq.name}
                                </h3>
                                {!inq.isRead && (
                                  <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                                    NEW
                                  </span>
                                )}
                                <a
                                  href={`tel:${inq.phone}`}
                                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-0.5 rounded-full border border-primary-100 dark:border-primary-900 flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  {inq.phone}
                                </a>
                                <span className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              {/* Customer Message Bubble */}
                              <div className="bg-gray-100/80 dark:bg-slate-800 text-gray-800 dark:text-slate-200 text-sm p-3 rounded-2xl rounded-tl-xs mb-2 border border-gray-200/50 dark:border-slate-700 leading-relaxed">
                                <p className="italic">"{inq.message}"</p>
                              </div>

                              {/* Target Property Tag */}
                              {inq.listing && (
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                                  <span className="font-medium text-gray-700 dark:text-slate-300">Property:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white truncate">
                                    {inq.listing.name}
                                  </span>
                                  {inq.listing.area && <span>({inq.listing.area})</span>}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Direct Reply Actions */}
                          <div className="flex flex-wrap items-center gap-2 self-end lg:self-center flex-shrink-0">
                            {/* Live Chat Button */}
                            <button
                              type="button"
                              onClick={() => openChatForInquiry(inq)}
                              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Reply / Chat</span>
                            </button>

                            {/* WhatsApp Button */}
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            {/* Call Button */}
                            <a
                              href={`tel:${inq.phone}`}
                              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call</span>
                            </a>

                            {/* Delete Inquiry */}
                            <button
                              type="button"
                              onClick={() => deleteInquiry(inq._id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                              title="Delete inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {itemToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Property Listing?</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">{itemToDelete.name}</strong>? This action cannot be undone.
              </p>
              {deleteError && <p className="text-xs text-red-500 mb-4">{deleteError}</p>}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-2 transition-colors shadow-md"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Chat Modal */}
        {selectedConversationId && (
          <ChatBoxModal
            conversationId={selectedConversationId}
            onClose={() => setSelectedConversationId(null)}
            currentUserRole="provider"
            currentUserName={user?.name || "Provider"}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
