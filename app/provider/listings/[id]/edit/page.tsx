"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Building2,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageUploadSection from "@/components/provider/ImageUploadSection";

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

const AMENITIES_OPTIONS = [
  "Wi-Fi",
  "AC",
  "Food Included",
  "Furnished",
  "Washing Machine",
  "Attached Bathroom",
  "24/7 Security & CCTV",
  "Power Backup / Inverter",
  "Water Purifier (RO)",
  "Geyser / Hot Water",
  "Bike / Car Parking",
  "Study Room / Table",
  "Daily Housekeeping",
];

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [listingType, setListingType] = useState<string>("pg");
  const [isTiffin, setIsTiffin] = useState(false);

  // Common Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("Manish Nagar");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState("active");

  // Stay specific fields
  const [depositAmount, setDepositAmount] = useState("");
  const [roomType, setRoomType] = useState("single");
  const [genderPreference, setGenderPreference] = useState("any");
  const [targetAudience, setTargetAudience] = useState("any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [rules, setRules] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // Tiffin specific fields
  const [foodType, setFoodType] = useState("veg");
  const [mealsPerDay, setMealsPerDay] = useState("2");
  const [hasBreakfast, setHasBreakfast] = useState(false);
  const [hasLunch, setHasLunch] = useState(true);
  const [hasDinner, setHasDinner] = useState(true);
  const [hasDelivery, setHasDelivery] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState("0");
  const [dailyPrice, setDailyPrice] = useState("");
  const [menuDescription, setMenuDescription] = useState("");

  // Load existing listing
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!listingId) return;

    fetch(`/api/listings/${listingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to load listing");
        }
        return res.json();
      })
      .then((json) => {
        const item = json.data;
        if (!item) throw new Error("Listing not found");

        setTitle(item.name || "");
        setDescription(item.description || "");
        setArea(item.area || "Manish Nagar");
        setAddress(item.address || (item.area ? `${item.area}, Nagpur` : ""));
        setImages(item.images || []);
        setStatus(item.status || "active");

        if (item.isTiffin) {
          setIsTiffin(true);
          setListingType("tiffin");
          setPrice(String(item.monthlyPrice || ""));
          setDailyPrice(String(item.dailyPrice || ""));
          setFoodType(item.foodType || "veg");
          setMealsPerDay(String(item.mealsPerDay || "2"));
          setHasBreakfast(Boolean(item.hasBreakfast));
          setHasLunch(Boolean(item.hasLunch));
          setHasDinner(Boolean(item.hasDinner));
          setHasDelivery(Boolean(item.hasDelivery));
          setDeliveryCharge(String(item.deliveryCharge || "0"));
          setMenuDescription(item.menuDescription || "");
        } else {
          setIsTiffin(false);
          setListingType(item.propertyType || "pg");
          setPrice(String(item.monthlyRent || ""));
          setDepositAmount(String(item.depositAmount || ""));
          setRoomType(item.roomType || "single");
          setGenderPreference(item.genderPreference || "any");
          setTargetAudience(item.targetAudience || "any");
          setSelectedAmenities(item.amenities || []);
          setRules(Array.isArray(item.rules) ? item.rules.join("\n") : "");
          setIsAvailable(item.isAvailable !== false);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Could not load listing.");
      })
      .finally(() => setIsLoading(false));
  }, [listingId, router]);

  const toggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!title.trim() || !price || !area) {
      setError("Please fill all required fields (Title, Price, Area).");
      return;
    }

    if (images.length === 0) {
      setError("Please provide at least 1 image for your listing.");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        area,
        address: address.trim(),
        images,
        status,
        // Stay specific
        propertyType: listingType,
        depositAmount: Number(depositAmount) || 0,
        roomType,
        genderPreference,
        targetAudience,
        amenities: selectedAmenities,
        rules: rules.split("\n").map((r) => r.trim()).filter(Boolean),
        isFoodIncluded: selectedAmenities.includes("Food Included"),
        isAC: selectedAmenities.includes("AC"),
        isFurnished: selectedAmenities.includes("Furnished"),
        hasParking: selectedAmenities.includes("Bike / Car Parking"),
        hasLaundry: selectedAmenities.includes("Washing Machine"),
        hasAttachedBathroom: selectedAmenities.includes("Attached Bathroom"),
        hasWifi: selectedAmenities.includes("Wi-Fi"),
        isAvailable,
        // Tiffin specific
        foodType,
        mealsPerDay: Number(mealsPerDay),
        hasBreakfast,
        hasLunch,
        hasDinner,
        dailyPrice: Number(dailyPrice) || 0,
        hasDelivery,
        deliveryCharge: Number(deliveryCharge) || 0,
        deliveryAreas: [area],
        menuDescription,
      };

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update listing.");
        setIsSaving(false);
        return;
      }

      setSuccessMsg("Listing updated successfully! Redirecting...");
      setTimeout(() => {
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        } else {
          router.push("/provider/dashboard");
        }
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to delete listing.");
        setIsDeleting(false);
        setShowDeleteConfirm(false);
        return;
      }

      router.push("/provider/dashboard");
    } catch (err) {
      console.error(err);
      setError("Error deleting listing.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading listing details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-4xl mx-auto">
          {/* Top Bar / Breadcrumb */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/provider/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 px-3.5 py-1.5 rounded-lg transition-colors border border-red-200 dark:border-red-900/60"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Listing
            </button>
          </div>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Edit Listing
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Update photos, pricing, amenities, or availability.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl flex gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">{successMsg}</p>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleUpdate} className="space-y-8">
            {/* 1. Category Indicator */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                  {isTiffin ? "🍱" : "🏠"}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                    {isTiffin ? "Tiffin / Food Service" : `Accommodation (${listingType.toUpperCase()})`}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Category: {isTiffin ? "Home Food Service" : "Residential Property"}
                  </p>
                </div>
              </div>

              {/* Status switcher */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="paused">Paused (Hidden)</option>
                </select>
              </div>
            </div>

            {/* 2. Photo Gallery Input (4 Images Layout) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 p-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-500" />
                Property Photos (4 Images Gallery)
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
                Update or reorder your 4 photos. The first image is your main cover photo!
              </p>

              <ImageUploadSection
                images={images}
                onChange={setImages}
                listingType={listingType}
              />
            </div>

            {/* 3. Basic Information */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 p-6 space-y-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                Location & Basic Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    Listing Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Select Area / Locality */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    Nagpur Locality / Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="input-field"
                  >
                    {NAGPUR_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monthly Rent / Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    Monthly Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Exact Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    Full Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Plot 42, Near D-Mart, Manish Nagar, Nagpur"
                    className="input-field"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    Description & Highlights
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Specifications */}
            {!isTiffin ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 p-6 space-y-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  Accommodation Specifications
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Room Occupancy
                    </label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="input-field"
                    >
                      <option value="single">Single Occupancy</option>
                      <option value="double">Double Sharing</option>
                      <option value="triple">Triple Sharing</option>
                      <option value="dormitory">Dormitory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Gender Preference
                    </label>
                    <select
                      value={genderPreference}
                      onChange={(e) => setGenderPreference(e.target.value)}
                      className="input-field"
                    >
                      <option value="any">Co-ed / Any</option>
                      <option value="male">Boys Only</option>
                      <option value="female">Girls Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-3">
                    Available Amenities
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {AMENITIES_OPTIONS.map((item) => {
                      const isChecked = selectedAmenities.includes(item);
                      return (
                        <label
                          key={item}
                          onClick={() => toggleAmenity(item)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                            isChecked
                              ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/60 text-primary-900 dark:text-primary-300"
                              : "border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-primary-500 focus:ring-primary-400 dark:bg-slate-800"
                          />
                          <span>{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Rules */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    House Rules
                  </label>
                  <textarea
                    rows={2}
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 p-6 space-y-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  Meal & Delivery Options
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Food Type
                    </label>
                    <select
                      value={foodType}
                      onChange={(e) => setFoodType(e.target.value)}
                      className="input-field"
                    >
                      <option value="veg">🟢 Pure Veg</option>
                      <option value="non-veg">🔴 Non-Veg</option>
                      <option value="jain">🟣 Jain</option>
                      <option value="veg-nonveg">🟡 Veg & Non-Veg</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Meals per Day
                    </label>
                    <select
                      value={mealsPerDay}
                      onChange={(e) => setMealsPerDay(e.target.value)}
                      className="input-field"
                    >
                      <option value="1">1 Meal</option>
                      <option value="2">2 Meals</option>
                      <option value="3">3 Meals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Daily Price (₹)
                    </label>
                    <input
                      type="number"
                      value={dailyPrice}
                      onChange={(e) => setDailyPrice(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Delivery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDelivery}
                      onChange={(e) => setHasDelivery(e.target.checked)}
                      className="w-4 h-4 text-primary-500 rounded dark:bg-slate-800"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">Home Delivery</p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">Deliver to doorstep</p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Delivery Charge (₹)
                    </label>
                    <input
                      type="number"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    Menu Description
                  </label>
                  <textarea
                    rows={2}
                    value={menuDescription}
                    onChange={(e) => setMenuDescription(e.target.value)}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base flex items-center justify-center gap-2 shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>Save & Update Listing</>
                )}
              </button>

              <Link
                href="/provider/dashboard"
                className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white py-2 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete this listing?
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white font-sans">{title}</span>? This action cannot be undone and will immediately remove the listing from StayNest.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2 shadow-md"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
