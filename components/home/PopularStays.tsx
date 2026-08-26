import Link from "next/link";
import { StayListing } from "@/types";
import ListingCard from "@/components/listings/ListingCard";

import { dbConnect } from "@/lib/db";
import { StayListing as StayModel } from "@/models/StayListing";

async function getPopularStays(): Promise<StayListing[]> {
  try {
    await dbConnect();
    const stays = await StayModel.find({ status: "active", isAvailable: true })
      .sort({ avgRating: -1, totalReviews: -1 })
      .limit(6)
      .lean();
    return JSON.parse(JSON.stringify(stays));
  } catch {
    return [];
  }
}

export default async function PopularStays() {
  const stays = await getPopularStays();

  if (stays.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-warm-50 dark:bg-slate-900/40 border-b border-gray-100 dark:border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="section-badge bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-900/60 text-primary-700 dark:text-primary-400">
              🏠 Verified Stays
            </div>
            <h2 className="section-title">Popular Verified Stays</h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1.5">
              Top-rated PGs, shared rooms, and private flats verified for students and working professionals.
            </p>
          </div>
          <Link href="/stays" className="btn-secondary self-start sm:self-auto text-sm px-4 py-2">
            View All Stays →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stays.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>

        <div className="mt-8 sm:hidden text-center">
          <Link href="/stays" className="btn-secondary w-full text-sm py-2.5">
            View All Stays
          </Link>
        </div>
      </div>
    </section>
  );
}
