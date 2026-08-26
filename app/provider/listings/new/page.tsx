"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Building2,
  UtensilsCrossed,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
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

export default function NewListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500 mr-2" />
          Loading...
        </div>
      }
    >
      <NewListingPageContent />
    </Suspense>
  );
}

function NewListingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const initialType = searchParams.get("type") || "pg";
  const [listingType, setListingType] = useState<string>(initialType);

  // Common Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("Manish Nagar");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  ]);

  // Stay specific fields
  const [depositAmount, setDepositAmount] = useState("");
  const [roomType, setRoomType] = useState("single");
  const [genderPreference, setGenderPreference] = useState("any");
  const [targetAudience, setTargetAudience] = useState("any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Wi-Fi",
    "Furnished",
    "Water Purifier (RO)",
  ]);
  const [rules, setRules] = useState("No smoking inside\nGuests allowed till 9 PM");

  // Tiffin specific fields
  const [foodType, setFoodType] = useState("veg");
  const [mealsPerDay, setMealsPerDay] = useState("2");
  const [hasBreakfast, setHasBreakfast] = useState(false);
  const [hasLunch, setHasLunch] = useState(true);
  const [hasDinner, setHasDinner] = useState(true);
  const [hasDelivery, setHasDelivery] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState("0");
  const [dailyPrice, setDailyPrice] = useState("");
  const [menuDescription, setMenuDescription] = useState(
    "Dal Tadka, Steamed Rice, 2 Seasonal Sabzis, 4 Chapatis, Salad, Pickle"
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsLoading(false);
  }, [router]);

  const toggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const isTiffin = listingType === "tiffin";

      const payload = {
        type: listingType,
        title: title.trim(),
        description: description.trim() || `${title} located in ${area}, Nagpur.`,
        price: Number(price),
        area,
        address: address.trim() || `${area}, Nagpur, Maharashtra`,
        images,
        // Stay specific
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

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create listing.");
        setIsSaving(false);
        return;
      }

      setSuccessMsg("Listing created successfully! Redirecting...");
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const isTiffin = listingType === "tiffin";

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
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-900">
              ⚡ 4-Photos Gallery Supported
            </span>
          </div>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Create a New Listing
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Add photos, details, and price for your Nagpur property or tiffin service.
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
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Category Selection */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 p-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-500" />
                1. Select Listing Category
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: "pg", label: "PG Stay", icon: "🏠" },
                  { id: "flat", label: "Flat / Apartment", icon: "🏢" },
                  { id: "room", label: "Single Room", icon: "🛏️" },
                  { id: "hostel", label: "Hostel", icon: "🏬" },
                  { id: "tiffin", label: "Tiffin Service", icon: "🍱" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setListingType(cat.id);
                      if (cat.id === "tiffin") {
                        setImages([
                          "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
                          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
                          "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?w=800&q=80",
                          "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
                        ]);
                      }
                    }}
                    className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      listingType === cat.id
                        ? "border-primary-500 bg-primary-50/40 dark:bg-primary-950/60 shadow-sm ring-2 ring-primary-500/20 font-semibold text-primary-900 dark:text-primary-300"
                        : "border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800/80"
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Photo Gallery Input (4 Images matching user screenshot) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 p-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-500" />
                2. Property Photos (4 Images Layout)
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
                Upload or paste image URLs. The first image will be your main large banner photo!
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
                3. Location & Basic Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Listing Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      isTiffin
                        ? "e.g., Sunita Home Foods & Tiffin Service"
                        : "e.g., Sai Comfort Luxury PG for Boys"
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Select Area / Locality */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Monthly Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      placeholder={isTiffin ? "2500" : "8000"}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Exact Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Address / Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Plot 42, Near D-Mart, Manish Nagar, Nagpur"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Description & Highlights
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe cleanliness, nearby colleges/companies, vibe, transport accessibility..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Category-Specific Fields */}
            {!isTiffin ? (
              /* Stay Specific Configuration */
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 p-6 space-y-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  4. Accommodation Specifications
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
                      <option value="double">Double Sharing (2 Beds)</option>
                      <option value="triple">Triple Sharing (3 Beds)</option>
                      <option value="dormitory">Dormitory Style</option>
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
                      Target Audience
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="input-field"
                    >
                      <option value="any">Students & Professionals</option>
                      <option value="student">Students Preferred</option>
                      <option value="professional">Corporate / Working Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Amenities Checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-3">
                    Select Available Amenities
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

                {/* House Rules */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    House Rules (One rule per line)
                  </label>
                  <textarea
                    rows={2}
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    className="input-field resize-none"
                    placeholder="e.g. Entry by 10 PM&#10;No smoking indoors"
                  />
                </div>
              </div>
            ) : (
              /* Tiffin Specific Configuration */
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 p-6 space-y-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  4. Meal & Delivery Options
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
                      <option value="jain">🟣 Jain (No Onion/Garlic)</option>
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
                      <option value="1">1 Meal (Lunch or Dinner)</option>
                      <option value="2">2 Meals (Lunch & Dinner)</option>
                      <option value="3">3 Meals (Full Day)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Daily Trial Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={dailyPrice}
                      onChange={(e) => setDailyPrice(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Delivery details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDelivery}
                      onChange={(e) => setHasDelivery(e.target.checked)}
                      className="w-4 h-4 text-primary-500 rounded dark:bg-slate-800"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">Home / Office Delivery</p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">Do you deliver to customer doorstep?</p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                      Delivery Charge (₹, 0 for free)
                    </label>
                    <input
                      type="number"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Sample Menu */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    Typical Menu Description
                  </label>
                  <textarea
                    rows={2}
                    value={menuDescription}
                    onChange={(e) => setMenuDescription(e.target.value)}
                    className="input-field resize-none"
                    placeholder="e.g., Dal Tadka, Jeera Rice, 2 Sabzi, 4 Chapatis, Salad, Buttermilk"
                  />
                </div>
              </div>
            )}

            {/* Submit CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publishing Listing...
                  </>
                ) : (
                  <>Publish Listing to StayNest</>
                )}
              </button>

              <Link
                href="/provider/dashboard"
                className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white py-2 transition-colors"
              >
                Cancel & Return
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
