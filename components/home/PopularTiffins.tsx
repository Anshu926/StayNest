import Link from "next/link";
import { TiffinListing } from "@/types";
import TiffinCard from "@/components/listings/TiffinCard";

import { dbConnect } from "@/lib/db";
import { TiffinListing as TiffinModel } from "@/models/TiffinListing";

async function getPopularTiffins(): Promise<TiffinListing[]> {
  try {
    await dbConnect();
    const tiffins = await TiffinModel.find({ status: "active" })
      .sort({ avgRating: -1, totalReviews: -1 })
      .limit(6)
      .lean();
    return JSON.parse(JSON.stringify(tiffins));
  } catch {
    return [];
  }
}

export default async function PopularTiffins() {
  const tiffins = await getPopularTiffins();

  if (tiffins.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="section-badge bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400">
              🍱 Homemade Food
            </div>
            <h2 className="section-title">Popular Tiffin Services</h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1.5">
              Wholesome, home-cooked daily meals delivered straight to your PG or flat.
            </p>
          </div>
          <Link href="/tiffins" className="btn-secondary self-start sm:self-auto text-sm px-4 py-2">
            View All Tiffins →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiffins.map((listing) => (
            <TiffinCard key={listing._id} listing={listing} />
          ))}
        </div>

        <div className="mt-8 sm:hidden text-center">
          <Link href="/tiffins" className="btn-secondary w-full text-sm py-2.5">
            View All Tiffins
          </Link>
        </div>
      </div>
    </section>
  );
}
