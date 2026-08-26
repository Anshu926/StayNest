"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bookmark, Home, UtensilsCrossed, ArrowRight, Loader2, Sparkles, FolderHeart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ListingCard from "@/components/listings/ListingCard";
import TiffinCard from "@/components/listings/TiffinCard";
import { StayListing, TiffinListing } from "@/types";

const GUEST_SAVED_KEY = "nagpurnest_guest_saved";

export default function SavedCollectionPage() {
  const [activeTab, setActiveTab] = useState<"all" | "stays" | "tiffins">("all");
  const [stays, setStays] = useState<StayListing[]>([]);
  const [tiffins, setTiffins] = useState<TiffinListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadSaved = useCallback(async () => {
    setIsLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(Boolean(token));

    if (token) {
      // Authenticated user: load from MongoDB
      try {
        const res = await fetch("/api/saved", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setStays(json.data?.stays || []);
          setTiffins(json.data?.tiffins || []);
        }
      } catch (err) {
        console.error("Error loading saved items:", err);
      }
    } else {
      // Guest user: load from local storage
      try {
        const guestIds: string[] = JSON.parse(localStorage.getItem(GUEST_SAVED_KEY) || "[]");
        if (guestIds.length > 0) {
          const [staysRes, tiffinsRes] = await Promise.all([
            fetch("/api/stays?limit=50"),
            fetch("/api/tiffins?limit=50"),
          ]);
          const staysData = await staysRes.json();
          const tiffinsData = await tiffinsRes.json();

          const matchedStays = (staysData.data || []).filter((s: StayListing) =>
            guestIds.includes(s._id)
          );
          const matchedTiffins = (tiffinsData.data || []).filter((t: TiffinListing) =>
            guestIds.includes(t._id)
          );

          setStays(matchedStays);
          setTiffins(matchedTiffins);
        } else {
          setStays([]);
          setTiffins([]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSaved();
    window.addEventListener("saved-updated", loadSaved);
    return () => window.removeEventListener("saved-updated", loadSaved);
  }, [loadSaved]);

  const totalCount = stays.length + tiffins.length;

  const filteredStays = activeTab === "tiffins" ? [] : stays;
  const filteredTiffins = activeTab === "stays" ? [] : tiffins;

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200/80 dark:border-amber-900/60 mb-2">
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                Curated Collection
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Your Saved Bookmarks
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                A curated collection of listings organized for future planning, comparing, and decision making.
              </p>
            </div>

            {!isLoggedIn && totalCount > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex items-center justify-between gap-4 max-w-md shadow-sm">
                <div className="text-xs text-amber-900 dark:text-amber-300">
                  <span className="font-bold">Sync across devices:</span> Sign in to keep your curated saved collection securely backed up.
                </div>
                <Link
                  href="/login"
                  className="btn-primary text-xs px-3.5 py-1.5 whitespace-nowrap flex-shrink-0"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-gray-100 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "all"
                  ? "bg-amber-500 text-white shadow-warm"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>All Saved</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === "all" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
              }`}>
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("stays")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "stays"
                  ? "bg-amber-500 text-white shadow-warm"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>PGs & Stays</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === "stays" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
              }`}>
                {stays.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("tiffins")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "tiffins"
                  ? "bg-amber-500 text-white shadow-warm"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Tiffin Services</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === "tiffins" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
              }`}>
                {tiffins.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Loading your saved collection...</p>
          </div>
        ) : totalCount === 0 ? (
          /* Empty State */
          <div className="card p-8 sm:p-14 text-center max-w-xl mx-auto my-8 shadow-sm">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/60 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 dark:border-amber-900/60">
              <Bookmark className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No saved bookmarks yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
              Organize your moving plans by bookmarking listings you are considering. Click the bookmark icon on any card to save it to this collection.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/stays"
                className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Home className="w-4 h-4" />
                <span>Explore Stays</span>
              </Link>
              <Link
                href="/tiffins"
                className="btn-secondary w-full sm:w-auto px-6 py-2.5 text-sm flex items-center justify-center gap-2"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Find Tiffin Services</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Grid of Saved Items */
          <div className="space-y-10">
            {/* Stays Section */}
            {filteredStays.length > 0 && (
              <div>
                {activeTab === "all" && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Home className="w-5 h-5 text-amber-500" />
                      Bookmarked PGs & Stays ({filteredStays.length})
                    </h2>
                    <Link
                      href="/stays"
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      Find more <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredStays.map((stay) => (
                    <ListingCard key={stay._id} listing={stay} />
                  ))}
                </div>
              </div>
            )}

            {/* Tiffins Section */}
            {filteredTiffins.length > 0 && (
              <div>
                {activeTab === "all" && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                      Bookmarked Tiffin Services ({filteredTiffins.length})
                    </h2>
                    <Link
                      href="/tiffins"
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      Find more <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredTiffins.map((tiffin) => (
                    <TiffinCard key={tiffin._id} listing={tiffin} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
