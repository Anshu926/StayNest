"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, LayoutGrid, List } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { StayListing } from "@/types";

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

export default function StaysPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
          Loading stays…
        </div>
      }
    >
      <StaysPageContent />
    </Suspense>
  );
}

function StaysPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [stays, setStays] = useState<StayListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || "",
  );
  const [targetAudience, setTargetAudience] = useState(
    searchParams.get("targetAudience") || "",
  );
  const [genderPreference, setGenderPreference] = useState(
    searchParams.get("genderPreference") || "",
  );
  const [isAC, setIsAC] = useState(searchParams.get("isAC") === "true");
  const [isFurnished, setIsFurnished] = useState(
    searchParams.get("isFurnished") === "true",
  );
  const [isFoodIncluded, setIsFoodIncluded] = useState(
    searchParams.get("isFoodIncluded") === "true",
  );
  const [hasWifi, setHasWifi] = useState(
    searchParams.get("hasWifi") === "true",
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const fetchStays = useCallback(
    async (p = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (area) params.set("area", area);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (propertyType) params.set("propertyType", propertyType);
      if (targetAudience) params.set("targetAudience", targetAudience);
      if (genderPreference) params.set("genderPreference", genderPreference);
      if (isAC) params.set("isAC", "true");
      if (isFurnished) params.set("isFurnished", "true");
      if (isFoodIncluded) params.set("isFoodIncluded", "true");
      if (hasWifi) params.set("hasWifi", "true");
      params.set("sort", sort);
      params.set("page", String(p));
      params.set("limit", "12");

      try {
        const res = await fetch(`/api/stays?${params.toString()}`);
        const data = await res.json();
        setStays(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setPage(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [
      search,
      area,
      maxPrice,
      propertyType,
      targetAudience,
      genderPreference,
      isAC,
      isFurnished,
      isFoodIncluded,
      hasWifi,
      sort,
    ],
  );

  useEffect(() => {
    fetchStays(1);
  }, [fetchStays]);

  const clearFilters = () => {
    setArea("");
    setMaxPrice("");
    setPropertyType("");
    setTargetAudience("");
    setGenderPreference("");
    setIsAC(false);
    setIsFurnished(false);
    setIsFoodIncluded(false);
    setHasWifi(false);
    setSearch("");
  };

  const CheckFilter = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 text-primary-500 focus:ring-primary-400 dark:bg-slate-800"
      />
      <span className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
    </label>
  );

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <Navbar />

      {/* Page header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-badge bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-900/60 text-primary-700 dark:text-primary-400">
            🏠 Accommodation Directory
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Find a Stay in Nagpur
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Browse verified PGs, rooms, flats, and hostels across Nagpur
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Search bar + sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PG name, area, or amenities..."
              className="input-field pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchStays(1)}
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
          {/* Filters sidebar */}
          <aside
            className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 flex-shrink-0`}
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 space-y-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Area
                </label>
                <select
                  className="input-field text-sm"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                >
                  <option value="">Any area</option>
                  {AREAS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Max Budget
                </label>
                <select
                  className="input-field text-sm"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                >
                  <option value="">No limit</option>
                  <option value="5000">₹5,000</option>
                  <option value="8000">₹8,000</option>
                  <option value="12000">₹12,000</option>
                  <option value="20000">₹20,000</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Property Type
                </label>
                <select
                  className="input-field text-sm"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="">Any type</option>
                  <option value="pg">PG</option>
                  <option value="flat">Flat</option>
                  <option value="hostel">Hostel</option>
                  <option value="single-room">Single Room</option>
                  <option value="shared-room">Shared Room</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  I'm a
                </label>
                <select
                  className="input-field text-sm"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Gender
                </label>
                <select
                  className="input-field text-sm"
                  value={genderPreference}
                  onChange={(e) => setGenderPreference(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="male">Boys</option>
                  <option value="female">Girls</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Amenities
                </label>
                <div className="space-y-2">
                  <CheckFilter label="AC" checked={isAC} onChange={setIsAC} />
                  <CheckFilter
                    label="Furnished"
                    checked={isFurnished}
                    onChange={setIsFurnished}
                  />
                  <CheckFilter
                    label="Food Included"
                    checked={isFoodIncluded}
                    onChange={setIsFoodIncluded}
                  />
                  <CheckFilter
                    label="Wi-Fi"
                    checked={hasWifi}
                    onChange={setHasWifi}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading
                  ? "Searching..."
                  : `${total} ${total === 1 ? "stay" : "stays"} found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-80 rounded-2xl" />
                ))}
              </div>
            ) : stays.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-8">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No stays found
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
                  We couldn't find any stays matching your current search criteria. Try clearing some filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary text-sm px-6 py-2.5"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {stays.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      disabled={page === 1}
                      onClick={() => fetchStays(page - 1)}
                      className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => fetchStays(page + 1)}
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
