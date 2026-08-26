"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"type" | "details">("type");
  const [userType, setUserType] = useState<"customer" | "provider" | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleUserTypeSelect = (type: "customer" | "provider") => {
    setUserType(type);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      // Store token & user info
      if (data.token) {
        localStorage.setItem("token", data.token);
        document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user.id || data.user._id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
          })
        );
      }

      // Notify Navbar to update immediately (same-tab)
      window.dispatchEvent(new Event("auth-change"));

      // Redirect based on role
      if (userType === "provider") {
        router.push("/provider/onboarding");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "type") {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-16 px-4 flex items-center justify-center">
          <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="section-badge bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-900/60 text-primary-700 dark:text-primary-400">
                ✨ Get Started Free
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                Join StayNest
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400">
                Choose your account type to begin
              </p>
            </div>

            {/* User Type Selection */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Customer Card */}
              <button
                onClick={() => handleUserTypeSelect("customer")}
                className="card p-8 text-center hover:-translate-y-1.5 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Looking for a Place?
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Find and save verified PGs, rooms, flats, and daily tiffin meals across Nagpur
                  </p>
                </div>
                <span className="btn-secondary w-full group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all font-semibold text-xs sm:text-sm py-2.5">
                  Continue as Customer →
                </span>
              </button>

              {/* Provider Card */}
              <button
                onClick={() => handleUserTypeSelect("provider")}
                className="card p-8 text-center hover:-translate-y-1.5 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Listing Your Service?
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
                    List your PG, room, flat, or tiffin service and connect directly with tenants & customers
                  </p>
                </div>
                <span className="btn-secondary w-full group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all font-semibold text-xs sm:text-sm py-2.5">
                  Continue as Provider →
                </span>
              </button>
            </div>

            {/* Footer Link */}
            <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-8">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* Card */}
          <div className="card p-8 shadow-xl border border-gray-100 dark:border-slate-800">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="inline-block text-xs font-semibold px-3 py-1 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 rounded-full border border-primary-200/80 dark:border-primary-900 mb-3 capitalize">
                {userType} Registration
              </span>
              <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {userType === "provider"
                  ? "List Your Service"
                  : "Create Account"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                {userType === "provider"
                  ? "Set up your provider account on StayNest"
                  : "Join the Nagpur community in 60 seconds"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-sm font-semibold mt-3"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Creating Account..." : "Create Free Account"}
              </button>
            </form>

            {/* Back Button */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setStep("type");
                  setUserType(null);
                }}
                className="text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white font-medium"
              >
                ← Back to type
              </button>

              <Link
                href="/login"
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Already registered? Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
