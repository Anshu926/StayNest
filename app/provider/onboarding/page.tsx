"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    address: "",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "",
    phone: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.businessName ||
      !formData.businessType ||
      !formData.address ||
      !formData.pincode
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/provider/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to complete onboarding.");
        return;
      }

      // Redirect to provider dashboard
      router.push("/provider/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 transition-colors">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-950/60 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Tell us about your business to get started
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 p-6 sm:p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Business Name */}
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Business Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g., Cozy Homes PG"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Business Type */}
              <div>
                <label
                  htmlFor="businessType"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select a service type</option>
                  <option value="pg">PG (Paying Guest)</option>
                  <option value="room">Room for Rent</option>
                  <option value="flat">Flat for Rent</option>
                  <option value="hostel">Hostel</option>
                  <option value="tiffin">Tiffin Service</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Full Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address, building name, area"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* City & State Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled
                    className="input-field opacity-60 cursor-not-allowed bg-gray-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled
                    className="input-field opacity-60 cursor-not-allowed bg-gray-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label
                  htmlFor="pincode"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  required
                  maxLength={6}
                  className="input-field"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Business Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Business Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your business, facilities, amenities, etc."
                  rows={4}
                  className="input-field resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-8 shadow-md"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Completing Setup..." : "Complete Setup"}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-primary-50/50 dark:bg-primary-950/40 border border-primary-200/60 dark:border-primary-900/60 rounded-xl flex gap-3">
              <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-primary-800 dark:text-primary-300">
                You can update this information anytime from your dashboard
                after setup.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
