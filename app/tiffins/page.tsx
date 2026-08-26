"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import TiffinCard from "@/components/listings/TiffinCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TiffinListing } from "@/types";

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

export default function TiffinsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
          Loading tiffins…
        </div>
      }
    >
      <TiffinsPageContent />
    </Suspense>
  );
}

function TiffinsPageContent() {
  const searchParams = useSearchParams();
  const [tiffins, setTiffins] = useState<TiffinListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [foodType, setFoodType] = useState(searchParams.get("foodType") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [hasDelivery, setHasDelivery] = useState(false);
  const [sort, setSort] = useState("newest");

  const fetchTiffins = useCallback(
    async (p = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (area) params.set("area", area);
      if (foodType) params.set("foodType", foodType);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (hasDelivery) params.set("hasDelivery", "true");
      params.set("sort", sort);
      params.set("page", String(p));
      params.set("limit", "12");
      try {
        const res = await fetch(`/api/tiffins?${params.toString()}`);
        const data = await res.json();
        setTiffins(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setPage(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [search, area, foodType, maxPrice, hasDelivery, sort],
  );

  useEffect(() => {
    fetchTiffins(1);
  }, [fetchTiffins]);  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <Navbar />
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-badge bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400">
            🍱 Daily Meal Plans
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Find Tiffin Services in Nagpur
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Fresh, home-cooked daily meals delivered straight to your PG or flat
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tiffin services by name, food type, or area..."
              className="input-field pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchTiffins(1)}
            />
          </div>
          <button
            className="btn-secondary flex items-center justify-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters {showFilters ? "(Open)" : ""}
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
          <aside
            className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 flex-shrink-0`}
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 space-y-5 sticky top-20">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm pb-3 border-b border-gray-100 dark:border-slate-800">Filters</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
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
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Food Type
                </label>
                <select
                  className="input-field text-sm"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="veg">🟢 Pure Veg</option>
                  <option value="non-veg">🔴 Non-Veg</option>
                  <option value="jain">🟣 Jain</option>
                  <option value="veg-nonveg">🟡 Veg & Non-Veg</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Max Monthly Budget
                </label>
                <select
                  className="input-field text-sm"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="2000">Under ₹2,000</option>
                  <option value="3000">Under ₹3,000</option>
                  <option value="4000">Under ₹4,000</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={hasDelivery}
                  onChange={(e) => setHasDelivery(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 text-primary-500 focus:ring-primary-400 dark:bg-slate-800"
                />
                <span className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Delivery Available
                </span>
              </label>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">
              {loading
                ? "Searching tiffins..."
                : `${total} ${total === 1 ? "service" : "services"} found`}
            </p>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-72 rounded-2xl" />
                ))}
              </div>
            ) : tiffins.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-8">
                <div className="text-5xl mb-4">🍱</div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No tiffin services found
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
                  We couldn't find any tiffin services matching your filters. Try selecting a different area or food preference.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {tiffins.map((t) => (
                    <TiffinCard key={t._id} listing={t} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      disabled={page === 1}
                      onClick={() => fetchTiffins(page - 1)}
                      className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => fetchTiffins(page + 1)}
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
