"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Building2,
  User,
  Phone,
  MessageCircle,
  MapPin,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const NAGPUR_AREAS = [
  "Dharampeth",
  "Sadar",
  "Manish Nagar",
  "Wardha Road",
  "MIHAN",
  "Trimurti Nagar",
  "Sitabuldi",
  "Civil Lines",
  "Hingna",
  "Bajaj Nagar",
  "Laxmi Nagar",
  "Pratap Nagar",
];

export default function ProviderSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // User & Profile Data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [serviceType, setServiceType] = useState("pg");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Nagpur");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("440015");
  const [description, setDescription] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [totalListings, setTotalListings] = useState(0);

  // Security Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/provider/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to load provider profile.");
        }
        return res.json();
      })
      .then((json) => {
        const { user, profile } = json.data || {};
        if (user) {
          setName(user.name || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
        }
        if (profile) {
          setBusinessName(profile.businessName || user?.name || "");
          setPhone(profile.phone || user?.phone || "");
          setWhatsapp(profile.whatsapp || profile.phone || user?.phone || "");
          setServiceType(profile.serviceType || "pg");
          setAddress(profile.address || "");
          setCity(profile.city || "Nagpur");
          setState(profile.state || "Maharashtra");
          setPincode(profile.pincode || "440015");
          setDescription(profile.description || "");
          setIsVerified(Boolean(profile.isVerified));
          setVerificationStatus(profile.verificationStatus || "approved");
          setTotalListings(profile.totalListings || 0);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Could not load settings.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim() || "Provider";

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/provider/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          name: trimmedName,
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
          businessName: businessName.trim() || trimmedName,
          serviceType,
          address: address.trim(),
          city: city.trim() || "Nagpur",
          state: state.trim() || "Maharashtra",
          pincode: pincode.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update profile settings.");
        setIsSaving(false);
        return;
      }

      // Update local storage user profile
      if (data.data?.user) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
        window.dispatchEvent(new Event("auth-change"));
      }

      setSuccess("Profile settings saved successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/provider/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update password.");
        setIsSaving(false);
        return;
      }

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Bar / Breadcrumb */}
          <div className="flex items-center justify-between">
            <Link
              href="/provider/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isVerified ? "Verified Provider" : "Account Active"}
              </span>
            </div>
          </div>

          {/* Hero Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {name.charAt(0).toUpperCase() || "P"}
              </div>
              <div>
                <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {businessName || name || "Provider Account"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{email}</span>
                  <span>•</span>
                  <span>{totalListings} Active {totalListings === 1 ? "Listing" : "Listings"}</span>
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="bg-gray-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-700/60 text-xs space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 dark:text-slate-400">City:</span>
                <span className="font-semibold text-gray-900 dark:text-white">Nagpur, MH</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 dark:text-slate-400">WhatsApp Leads:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active 🟢</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-800 gap-6">
            <button
              onClick={() => {
                setActiveTab("profile");
                setError("");
                setSuccess("");
              }}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "profile"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Business & Contact Profile
            </button>

            <button
              onClick={() => {
                setActiveTab("security");
                setError("");
                setSuccess("");
              }}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "security"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Lock className="w-4 h-4" />
              Security & Password
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-2xl flex items-start gap-3 text-red-700 dark:text-red-300 text-sm animate-fade-in shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-sm animate-fade-in shadow-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: Business Profile */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Personal & Business Info */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 dark:border-slate-800 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-primary-500" />
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Contact & Business Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Owner / Contact Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Full Name (Owner / Manager)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Ramesh Sharma"
                      className="input-field"
                    />
                  </div>

                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Business / Entity Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g., Sharma Nest Properties"
                      className="input-field"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Primary Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g., 9876543210"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      WhatsApp Contact Number <span className="text-emerald-500 font-normal">(For direct chat leads)</span>
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="e.g., 9876543210"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  {/* Registered Email */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Registered Email Address <span className="text-gray-400 font-normal">(Login identifier)</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="input-field opacity-60 cursor-not-allowed bg-gray-50 dark:bg-slate-800"
                    />
                  </div>

                  {/* Primary Service Type */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Primary Service Type
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="input-field"
                    >
                      <option value="pg">Paying Guest (PG) Accommodations</option>
                      <option value="hostel">Student / Executive Hostels</option>
                      <option value="flat">Flats & Apartments for Rent</option>
                      <option value="room">Single / Shared Rooms</option>
                      <option value="tiffin">Tiffin & Daily Meal Services</option>
                      <option value="multiple">Multi-Service Provider</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location & Nagpur Office Address */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 dark:border-slate-800 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Operational Address & Location (Nagpur)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Street Address */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Office / Primary Address or Landmark
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g., Plot 42, Near D-Mart, Manish Nagar"
                      className="input-field"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      disabled
                      className="input-field opacity-60 cursor-not-allowed bg-gray-50 dark:bg-slate-800"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      disabled
                      className="input-field opacity-60 cursor-not-allowed bg-gray-50 dark:bg-slate-800"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Pincode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="440015"
                      className="input-field"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      About Your Business / Hospitality Bio
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell potential tenants about your experience, cleanliness standards, meal hygiene, or management style..."
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Profile */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-gray-100 dark:border-slate-800">
                <div>
                  {success && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Settings saved successfully!
                    </span>
                  )}
                  {error && (
                    <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm font-semibold animate-fade-in">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={isSaving}
                  className="btn-primary w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === "security" && (
            <form onSubmit={handleSavePassword} className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 dark:border-slate-800 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="w-5 h-5 text-primary-500" />
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Change Password
                  </h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Ensure your provider account is using a strong, unique password.
                </p>

                <div className="space-y-4 max-w-md">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      New Password (minimum 6 characters) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Password */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-gray-100 dark:border-slate-800">
                <div>
                  {success && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Password updated successfully!
                    </span>
                  )}
                  {error && (
                    <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm font-semibold animate-fade-in">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleSavePassword()}
                  disabled={isSaving}
                  className="btn-primary w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
