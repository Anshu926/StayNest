"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Heart,
  Home,
  UtensilsCrossed,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  ArrowRight,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Clock,
  Building,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatBoxModal from "@/components/chat/ChatBoxModal";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "provider" | "admin";
  createdAt: string;
}

interface RecentInquiry {
  _id: string;
  listingId: string;
  listingType: "stay" | "tiffin";
  name: string;
  phone: string;
  message: string;
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ favoritesCount: 0, inquiriesCount: 0 });
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to load profile");
      }

      const json = await res.json();
      if (json.data?.user) {
        setUser(json.data.user);
        setEditName(json.data.user.name || "");
        setEditPhone(json.data.user.phone || "");
        setStats(json.data.stats || { favoritesCount: 0, inquiriesCount: 0 });
        setRecentInquiries(json.data.recentInquiries || []);
      }
    } catch (err) {
      console.error(err);
      try {
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (localUser.name) {
          setUser({
            _id: "local",
            name: localUser.name,
            email: localUser.email,
            role: localUser.role || "customer",
            createdAt: new Date().toISOString(),
          });
          setEditName(localUser.name);
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsSaving(true);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim(),
          password: newPassword ? newPassword.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...stored,
          name: editName.trim(),
        })
      );
      window.dispatchEvent(new Event("auth-change"));

      if (user) {
        setUser({ ...user, name: editName.trim(), phone: editPhone.trim() });
      }

      setSuccessMsg("Profile updated successfully!");
      setIsEditing(false);
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-slate-400">Loading your account...</p>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const isProvider = user?.role === "provider";
  const isAdmin = user?.role === "admin";

  return (
    <main className="min-h-screen flex flex-col bg-gray-50/60 dark:bg-slate-950">
      <Navbar />

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-semibold">My Account</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm font-medium animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3 text-green-700 dark:text-green-400 text-sm font-medium animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: User Profile Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-card p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-primary-500 to-warm-400 opacity-90" />

              {/* Avatar */}
              <div className="relative pt-6 mb-3">
                <div className="w-20 h-20 mx-auto rounded-full bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 text-2xl font-bold flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
                  {initials}
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{user?.email}</p>

              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 capitalize border border-primary-100 dark:border-primary-900">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
                <span>{user?.role} Account</span>
              </div>

              {/* Profile Details List */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 text-left space-y-3 text-xs text-gray-600 dark:text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                  <span>{user?.phone || "No phone number added"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                  <span>
                    Member since{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })
                      : "2026"}
                  </span>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full py-2.5 px-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Close Edit Mode" : "Edit Profile Info"}</span>
                </button>
              </div>
            </div>

            {/* Provider Quick Banner if provider */}
            {isProvider && (
              <div className="bg-gradient-to-br from-primary-900 to-warm-900 text-white rounded-3xl p-6 shadow-card">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                  <LayoutDashboard className="w-5 h-5 text-primary-300" />
                </div>
                <h3 className="font-bold text-base mb-1">Provider Dashboard</h3>
                <p className="text-xs text-white/80 mb-4 leading-relaxed">
                  Manage your active Nagpur PG and Tiffin listings, edit photos, and update pricing.
                </p>
                <Link
                  href="/provider/dashboard"
                  className="inline-flex items-center gap-2 text-xs font-semibold bg-white text-primary-900 px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Edit Form, Inquiries & Shortcuts */}
          <div className="lg:col-span-2 space-y-6">
            {isEditing ? (
              /* Edit Profile Card */
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-card p-6 sm:p-8 animate-fade-in">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-primary-500" />
                  Update Your Profile
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
                  Update your contact details or change your account password.
                </p>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field text-sm"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="input-field text-sm"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                      <span>New Password (Optional)</span>
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field text-sm"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2 shadow-md"
                    >
                      {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Favorites Widget */}
              <Link
                href="/favorites"
                className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-card hover:shadow-lg p-6 flex items-center gap-4 transition-all group hover:-translate-y-0.5"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <Heart className="w-7 h-7 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Saved Favorites
                  </p>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                    {stats.favoritesCount} Saved
                  </h4>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1 flex items-center gap-1">
                    View collection <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </Link>

              {/* Exploration Hub */}
              <Link
                href="/stays"
                className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-card hover:shadow-lg p-6 flex items-center gap-4 transition-all group hover:-translate-y-0.5"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <Home className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Nagpur Stays
                  </p>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                    Find PGs & Rooms
                  </h4>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1 flex items-center gap-1">
                    Browse listings <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </Link>
            </div>

            {/* My Inquiries & Provider Chats */}
            {recentInquiries.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-card p-6 sm:p-8">
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-500" />
                  My Inquiries & Chats ({recentInquiries.length})
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
                  Properties and tiffin services you've contacted in Nagpur. Click to chat with the provider.
                </p>

                <div className="space-y-3">
                  {recentInquiries.map((inq) => (
                    <div
                      key={inq._id}
                      className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {inq.listing?.name || "Nagpur Property"}
                          </h4>
                          {inq.listing?.area && (
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              • {inq.listing.area}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-slate-300 italic line-clamp-1">
                          "{inq.message}"
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      {inq.conversationId && (
                        <button
                          type="button"
                          onClick={() => setSelectedConversationId(inq.conversationId!)}
                          className="px-3.5 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-center shadow-sm flex-shrink-0 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Live Chat</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services for Newcomers in Nagpur */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-card p-6 sm:p-8">
              <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white mb-1">
                Quick Shortcuts
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
                Discover trustworthy services curated for people moving to Nagpur.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/stays"
                  className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-primary-300 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 transition-all flex items-center gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 flex items-center justify-center text-lg">
                    🏠
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      Find PG & Flat
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Dharampeth, Sadar, Manish Nagar...</p>
                  </div>
                </Link>

                <Link
                  href="/tiffins"
                  className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-primary-300 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 transition-all flex items-center gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center text-lg">
                    🍱
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      Daily Tiffin Service
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Pure Veg, Jain & Maharashtrian meals</p>
                  </div>
                </Link>

                <Link
                  href="/areas"
                  className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-primary-300 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 transition-all flex items-center gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center text-lg">
                    🗺️
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      Explore 12 Localities
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Compare localities and colleges</p>
                  </div>
                </Link>

                <Link
                  href="/new-to-nagpur"
                  className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-primary-300 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 transition-all flex items-center gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center text-lg">
                    ✨
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      Newcomer City Guide
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Metro, safety, emergency helpline</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Live Chat Modal */}
      {selectedConversationId && (
        <ChatBoxModal
          conversationId={selectedConversationId}
          onClose={() => setSelectedConversationId(null)}
          currentUserRole="customer"
          currentUserName={user?.name || "Customer"}
        />
      )}

      <Footer />
    </main>
  );
}
