"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

const NAGPUR_AREAS = [
  "Dharampeth", "Sadar", "Manish Nagar", "Wardha Road", "MIHAN",
  "Trimurti Nagar", "Sitabuldi", "Civil Lines", "Hingna",
  "Bajaj Nagar", "Laxmi Nagar", "Pratap Nagar",
];

const AREA_SLUGS: Record<string, string> = {
  "Dharampeth": "dharampeth", "Sadar": "sadar", "Manish Nagar": "manish-nagar",
  "Wardha Road": "wardha-road", "MIHAN": "mihan", "Trimurti Nagar": "trimurti-nagar",
  "Sitabuldi": "sitabuldi", "Civil Lines": "civil-lines", "Hingna": "hingna",
  "Bajaj Nagar": "bajaj-nagar", "Laxmi Nagar": "laxmi-nagar", "Pratap Nagar": "pratap-nagar",
};

export default function HeroSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"stay" | "tiffin" | "study">("stay");

  // Stay form state
  const [stayArea, setStayArea] = useState("");
  const [stayBudget, setStayBudget] = useState("");
  const [stayType, setStayType] = useState("");
  const [stayFor, setStayFor] = useState("");

  // Tiffin form state
  const [tiffinArea, setTiffinArea] = useState("");
  const [foodType, setFoodType] = useState("");
  const [tiffinBudget, setTiffinBudget] = useState("");

  const handleStaySearch = () => {
    const params = new URLSearchParams();
    if (stayArea) params.set("area", AREA_SLUGS[stayArea] || stayArea.toLowerCase());
    if (stayBudget) params.set("maxPrice", stayBudget);
    if (stayType) params.set("propertyType", stayType);
    if (stayFor) params.set("targetAudience", stayFor);
    router.push(`/stays?${params.toString()}`);
  };

  const handleTiffinSearch = () => {
    const params = new URLSearchParams();
    if (tiffinArea) params.set("area", AREA_SLUGS[tiffinArea] || tiffinArea.toLowerCase());
    if (foodType) params.set("foodType", foodType);
    if (tiffinBudget) params.set("maxPrice", tiffinBudget);
    router.push(`/tiffins?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-b from-warm-50 via-white to-warm-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-12 pb-20 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="ambient-glow-orange top-0 right-1/4 w-[500px] h-[500px] opacity-70" />
        <div className="absolute -top-32 -left-20 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-primary-200/60 dark:border-primary-900/60 text-primary-700 dark:text-primary-400 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
            <MapPin className="w-3.5 h-3.5 text-primary-500" />
            Accommodation, Meal & Study Spaces Platform
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight leading-[1.15]">
            New to the City?
          </h1>

          <p className="text-xl sm:text-2xl text-gray-700 dark:text-slate-200 font-medium mb-3">
            Find your stay. Find your food.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-orange-600 font-semibold">
              Find study spaces.
            </span>
          </p>

          <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            Discover verified PGs, flats, home-cooked tiffins, and quiet study rooms — everything students and professionals need to thrive.
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-3xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 p-3 sm:p-4 transition-all">
          {/* Tabs */}
          <div className="flex gap-1.5 p-1.5 bg-gray-100/80 dark:bg-slate-800/80 rounded-2xl mb-4">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "stay"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-slate-700"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("stay")}
            >
              🏠 Find a Stay
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "tiffin"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-slate-700"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("tiffin")}
            >
              🍱 Find Tiffin
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "study"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-slate-700"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("study")}
            >
              📚 Study Space
            </button>
          </div>

          {/* Stay form */}
          {activeTab === "stay" && (
            <div className="p-2 sm:p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Select Area / Locality
                  </label>
                  <select
                    className="input-field"
                    value={stayArea}
                    onChange={(e) => setStayArea(e.target.value)}
                  >
                    <option value="">Any Area</option>
                    {NAGPUR_AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Monthly Budget
                  </label>
                  <select
                    className="input-field"
                    value={stayBudget}
                    onChange={(e) => setStayBudget(e.target.value)}
                  >
                    <option value="">Any Budget</option>
                    <option value="5000">Under ₹5,000</option>
                    <option value="8000">Under ₹8,000</option>
                    <option value="12000">Under ₹12,000</option>
                    <option value="20000">Under ₹20,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Property Type
                  </label>
                  <select
                    className="input-field"
                    value={stayType}
                    onChange={(e) => setStayType(e.target.value)}
                  >
                    <option value="">All Types (PG, Flat, Hostel)</option>
                    <option value="pg">PG</option>
                    <option value="flat">Flat</option>
                    <option value="hostel">Hostel</option>
                    <option value="single-room">Single Room</option>
                    <option value="shared-room">Shared Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Target Occupant
                  </label>
                  <select
                    className="input-field"
                    value={stayFor}
                    onChange={(e) => setStayFor(e.target.value)}
                  >
                    <option value="">Student / Professional</option>
                    <option value="student">Student</option>
                    <option value="professional">Working Professional</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleStaySearch}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 font-semibold"
              >
                <Search className="w-4 h-4" />
                Search Available Stays
              </button>
            </div>
          )}

          {/* Tiffin form */}
          {activeTab === "tiffin" && (
            <div className="p-2 sm:p-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Select Area / Locality
                  </label>
                  <select
                    className="input-field"
                    value={tiffinArea}
                    onChange={(e) => setTiffinArea(e.target.value)}
                  >
                    <option value="">Any Area</option>
                    {NAGPUR_AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Food Preference
                  </label>
                  <select
                    className="input-field"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                  >
                    <option value="">Any Food Type</option>
                    <option value="veg">🟢 Pure Veg</option>
                    <option value="non-veg">🔴 Non-Veg</option>
                    <option value="jain">🟣 Jain</option>
                    <option value="veg-nonveg">🟡 Veg & Non-Veg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Monthly Budget
                  </label>
                  <select
                    className="input-field"
                    value={tiffinBudget}
                    onChange={(e) => setTiffinBudget(e.target.value)}
                  >
                    <option value="">Any Budget</option>
                    <option value="2000">Under ₹2,000</option>
                    <option value="3000">Under ₹3,000</option>
                    <option value="4000">Under ₹4,000</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleTiffinSearch}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 font-semibold"
              >
                <Search className="w-4 h-4" />
                Search Tiffin Services
              </button>
            </div>
          )}

          {/* Study Space form */}
          {activeTab === "study" && (
            <div className="p-2 sm:p-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Select Area / Locality
                  </label>
                  <select
                    className="input-field"
                    onChange={(e) => router.push(`/study-spaces?area=${e.target.value}`)}
                  >
                    <option value="">Any Area</option>
                    {NAGPUR_AREAS.map((a) => (
                      <option key={a} value={AREA_SLUGS[a]}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Space Type
                  </label>
                  <select
                    className="input-field"
                    onChange={(e) => router.push(`/study-spaces?spaceType=${e.target.value}`)}
                  >
                    <option value="">All Types</option>
                    <option value="library">📚 Library</option>
                    <option value="cafe">☕ Study Café</option>
                    <option value="coworking">🖥️ Coworking</option>
                    <option value="private-room">🚪 Private Room</option>
                    <option value="study-hall">🏛️ Study Hall</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    I am a
                  </label>
                  <select
                    className="input-field"
                    onChange={(e) => router.push(`/study-spaces?targetAudience=${e.target.value}`)}
                  >
                    <option value="">Student / Professional</option>
                    <option value="student">Student</option>
                    <option value="professional">Working Professional</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => router.push("/study-spaces")}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 font-semibold"
              >
                <Search className="w-4 h-4" />
                Find Study Spaces
              </button>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto mt-12">
          {[
            { label: "Verified Stays", value: "15+", icon: "🏠" },
            { label: "Tiffin Services", value: "10+", icon: "🍱" },
            { label: "Study Spaces", value: "8+", icon: "📚" },
            { label: "Verified Providers", value: "100%", icon: "✅" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-gray-100 dark:border-slate-800/80 rounded-2xl p-3.5 sm:p-4 text-center shadow-sm hover:border-primary-200 dark:hover:border-primary-900 transition-colors"
            >
              <div className="text-xl mb-1">{stat.icon}</div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
              <span className="block text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
