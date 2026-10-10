"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, SlidersHorizontal, Wifi, Printer, Lock, Wind,
  Coffee, Car, Zap, Star, MapPin, Clock, Users, CheckCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

// ─── Types ──────────────────────────────────────────────────────────────────
interface StudySpace {
  _id: string;
  name: string;
  slug: string;
  description: string;
  spaceType: "library" | "cafe" | "coworking" | "private-room" | "study-hall" | "coaching-centre";
  area: string;
  areaSlug: string;
  address: string;
  hourlyPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
  hasWifi: boolean;
  hasPrinting: boolean;
  hasLocker: boolean;
  hasAC: boolean;
  hasCafe: boolean;
  hasParking: boolean;
  hasPowerOutlets: boolean;
  hasWhiteboard: boolean;
  openTime: string;
  closeTime: string;
  is24Hours: boolean;
  totalSeats: number;
  targetAudience: string;
  noiseLevel: "silent" | "quiet" | "moderate";
  images: string[];
  isVerified: boolean;
  avgRating: number;
  totalReviews: number;
  status: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const AREAS = [
  { label: "Dharampeth", value: "dharampeth" },
  { label: "Sadar", value: "sadar" },
  { label: "Manish Nagar", value: "manish-nagar" },
  { label: "Wardha Road", value: "wardha-road" },
  { label: "MIHAN", value: "mihan" },
  { label: "Trimurti Nagar", value: "trimurti-nagar" },
  { label: "Sitabuldi", value: "sitabuldi" },
  { label: "Civil Lines", value: "civil-lines" },
  { label: "Hingna", value: "hingna" },
  { label: "Bajaj Nagar", value: "bajaj-nagar" },
  { label: "Laxmi Nagar", value: "laxmi-nagar" },
  { label: "Pratap Nagar", value: "pratap-nagar" },
];

const SPACE_TYPE_LABELS: Record<string, string> = {
  library: "📚 Library",
  cafe: "☕ Study Café",
  coworking: "🖥️ Coworking",
  "private-room": "🚪 Private Room",
  "study-hall": "🏛️ Study Hall",
  "coaching-centre": "🎓 Coaching Centre",
};

const NOISE_LABELS: Record<string, { label: string; color: string }> = {
  silent: { label: "🔇 Silent", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  quiet: { label: "🔈 Quiet", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  moderate: { label: "🔉 Moderate", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
};

// ─── Main export ─────────────────────────────────────────────────────────────
export default function StudySpacesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center text-gray-500">
          Loading study spaces…
        </div>
      }
    >
      <StudySpacesContent />
    </Suspense>
  );
}

// ─── Page content ─────────────────────────────────────────────────────────────
function StudySpacesContent() {
  const searchParams = useSearchParams();

  const [spaces, setSpaces] = useState<StudySpace[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [spaceType, setSpaceType] = useState(searchParams.get("spaceType") || "");
  const [targetAudience, setTargetAudience] = useState(searchParams.get("targetAudience") || "");
  const [noiseLevel, setNoiseLevel] = useState(searchParams.get("noiseLevel") || "");
  const [hasWifi, setHasWifi] = useState(false);
  const [hasAC, setHasAC] = useState(false);
  const [hasPrinting, setHasPrinting] = useState(false);
  const [hasLocker, setHasLocker] = useState(false);
  const [sort, setSort] = useState("newest");

  const fetchSpaces = useCallback(
    async (p = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (area) params.set("area", area);
      if (spaceType) params.set("spaceType", spaceType);
      if (targetAudience) params.set("targetAudience", targetAudience);
      if (noiseLevel) params.set("noiseLevel", noiseLevel);
      if (hasWifi) params.set("hasWifi", "true");
      if (hasAC) params.set("hasAC", "true");
      if (hasPrinting) params.set("hasPrinting", "true");
      if (hasLocker) params.set("hasLocker", "true");
      params.set("sort", sort);
      params.set("page", String(p));
      params.set("limit", "12");

      try {
        const res = await fetch(`/api/study-spaces?${params.toString()}`);
        const data = await res.json();
        if (data.data?.length === 0 && p === 1) {
          // Auto-seed demo data on first empty load
          await seedDemoData();
          return;
        }
        setSpaces(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setPage(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [search, area, spaceType, targetAudience, noiseLevel, hasWifi, hasAC, hasPrinting, hasLocker, sort]
  );

  const seedDemoData = async () => {
    setSeeding(true);
    try {
      await fetch("/api/study-spaces/seed", { method: "POST" });
      // Re-fetch after seeding
      const res = await fetch(`/api/study-spaces?page=1&limit=12`);
      const data = await res.json();
      setSpaces(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces(1);
  }, [fetchSpaces]);

  const clearFilters = () => {
    setSearch(""); setArea(""); setSpaceType(""); setTargetAudience("");
    setNoiseLevel(""); setHasWifi(false); setHasAC(false);
    setHasPrinting(false); setHasLocker(false); setSort("newest");
  };

  const CheckFilter = ({
    label, icon, checked, onChange,
  }: { label: string; icon: React.ReactNode; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 text-primary-500 focus:ring-primary-400 dark:bg-slate-800"
      />
      <span className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {icon}
        {label}
      </span>
    </label>
  );

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <Navbar />

      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="section-badge bg-violet-50 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-900/60 text-violet-700 dark:text-violet-400">
            📚 Study Spaces Directory
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Find Study Rooms & Study Spaces
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Discover libraries, coworking spaces, private cabins, and study halls near you
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, area, or type..."
              className="input-field pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchSpaces(1)}
            />
          </div>
          <button
            className="btn-secondary flex items-center justify-center gap-2 sm:w-auto"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {showFilters ? "(Open)" : ""}
          </button>
          <select
            className="input-field sm:w-48"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 space-y-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Filters</h3>
                <button onClick={clearFilters} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                  Clear All
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Area</label>
                <select className="input-field text-sm" value={area} onChange={(e) => setArea(e.target.value)}>
                  <option value="">Any area</option>
                  {AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Space Type</label>
                <select className="input-field text-sm" value={spaceType} onChange={(e) => setSpaceType(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="library">📚 Library</option>
                  <option value="cafe">☕ Study Café</option>
                  <option value="coworking">🖥️ Coworking</option>
                  <option value="private-room">🚪 Private Room</option>
                  <option value="study-hall">🏛️ Study Hall</option>
                  <option value="coaching-centre">🎓 Coaching Centre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Target Audience</label>
                <select className="input-field text-sm" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}>
                  <option value="">Anyone</option>
                  <option value="student">Students</option>
                  <option value="professional">Professionals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Noise Level</label>
                <select className="input-field text-sm" value={noiseLevel} onChange={(e) => setNoiseLevel(e.target.value)}>
                  <option value="">Any</option>
                  <option value="silent">🔇 Silent</option>
                  <option value="quiet">🔈 Quiet</option>
                  <option value="moderate">🔉 Moderate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Amenities</label>
                <div className="space-y-2">
                  <CheckFilter label="Wi-Fi" icon={<Wifi className="w-3.5 h-3.5" />} checked={hasWifi} onChange={setHasWifi} />
                  <CheckFilter label="AC" icon={<Wind className="w-3.5 h-3.5" />} checked={hasAC} onChange={setHasAC} />
                  <CheckFilter label="Printing" icon={<Printer className="w-3.5 h-3.5" />} checked={hasPrinting} onChange={setHasPrinting} />
                  <CheckFilter label="Locker" icon={<Lock className="w-3.5 h-3.5" />} checked={hasLocker} onChange={setHasLocker} />
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading || seeding
                  ? "Loading..."
                  : `${total} ${total === 1 ? "space" : "spaces"} found`}
              </p>
            </div>

            {loading || seeding ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-80 rounded-2xl" />
                ))}
              </div>
            ) : spaces.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-8">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No study spaces found
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
                  Try clearing some filters or check back soon as more spaces get listed.
                </p>
                <button onClick={clearFilters} className="btn-primary text-sm px-6 py-2.5">
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {spaces.map((space) => (
                    <StudySpaceCard key={space._id} space={space} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      disabled={page === 1}
                      onClick={() => fetchSpaces(page - 1)}
                      className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => fetchSpaces(page + 1)}
                      className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// ─── Study Space Card ─────────────────────────────────────────────────────────
function StudySpaceCard({ space }: { space: StudySpace }) {
  const image =
    space.images?.[0] ||
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80";

  const priceDisplay = () => {
    if (space.hourlyPrice && space.hourlyPrice > 0) return `₹${space.hourlyPrice}/hr`;
    if (space.dailyPrice && space.dailyPrice > 0) return `₹${space.dailyPrice}/day`;
    if (space.monthlyPrice && space.monthlyPrice > 0) return `₹${space.monthlyPrice}/mo`;
    return "Free (Buy Coffee)";
  };

  const noise = NOISE_LABELS[space.noiseLevel];
  const typeLabel = SPACE_TYPE_LABELS[space.spaceType] || space.spaceType;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-44 overflow-hidden flex-shrink-0">
        <img
          src={image}
          alt={space.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-gray-700 dark:text-slate-200 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 dark:border-slate-700">
            {typeLabel}
          </span>
          {space.isVerified && (
            <span className="text-xs font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
        {space.is24Hours && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-bold bg-primary-500 text-white px-2 py-0.5 rounded-full">24/7</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title & Rating */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {space.name}
            </h3>
            {space.avgRating > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{space.avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{space.area}</span>
          </div>
        </div>

        {/* Noise + Seats */}
        <div className="flex items-center gap-2 flex-wrap">
          {noise && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${noise.color}`}>
              {noise.label}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
            <Users className="w-3 h-3" /> {space.totalSeats} seats
          </span>
          {!space.is24Hours && (
            <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {space.openTime}–{space.closeTime}
            </span>
          )}
        </div>

        {/* Amenity chips */}
        <div className="flex flex-wrap gap-1.5">
          {space.hasWifi && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
              <Wifi className="w-3 h-3" /> Wi-Fi
            </span>
          )}
          {space.hasAC && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
              <Wind className="w-3 h-3" /> AC
            </span>
          )}
          {space.hasPrinting && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
              <Printer className="w-3 h-3" /> Print
            </span>
          )}
          {space.hasLocker && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3" /> Locker
            </span>
          )}
          {space.hasCafe && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
              <Coffee className="w-3 h-3" /> Café
            </span>
          )}
          {space.hasParking && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
              <Car className="w-3 h-3" /> Parking
            </span>
          )}
          {space.hasPowerOutlets && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3" /> Power
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-slate-800">
          <div>
            <span className="font-bold text-base text-gray-900 dark:text-white">
              {priceDisplay()}
            </span>
            {space.monthlyPrice && space.monthlyPrice > 0 && space.hourlyPrice && space.hourlyPrice > 0 && (
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-1.5">
                · ₹{space.monthlyPrice}/mo
              </span>
            )}
          </div>
          <button className="btn-primary text-xs px-4 py-2">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
