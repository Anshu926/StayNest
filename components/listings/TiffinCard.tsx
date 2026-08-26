import Image from "next/image";
import Link from "next/link";
import { MapPin, Truck } from "lucide-react";
import { TiffinListing } from "@/types";
import { formatPrice } from "@/lib/utils";
import VerifiedBadge from "@/components/shared/VerifiedBadge";
import RatingStars from "@/components/shared/RatingStars";
import FavoriteButton from "@/components/shared/FavoriteButton";
import SaveButton from "@/components/shared/SaveButton";
import { cn } from "@/lib/utils";

const foodTypeConfig: Record<string, { label: string; lightClass: string; darkClass: string; icon: string }> = {
  veg: {
    label: "Pure Veg",
    lightClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    darkClass: "dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800",
    icon: "🟢",
  },
  "non-veg": {
    label: "Non-Veg",
    lightClass: "text-rose-700 bg-rose-50 border-rose-200",
    darkClass: "dark:text-rose-400 dark:bg-rose-950/60 dark:border-rose-800",
    icon: "🔴",
  },
  jain: {
    label: "Jain",
    lightClass: "text-purple-700 bg-purple-50 border-purple-200",
    darkClass: "dark:text-purple-400 dark:bg-purple-950/60 dark:border-purple-800",
    icon: "🟣",
  },
  "veg-nonveg": {
    label: "Veg & Non-Veg",
    lightClass: "text-amber-700 bg-amber-50 border-amber-200",
    darkClass: "dark:text-amber-400 dark:bg-amber-950/60 dark:border-amber-800",
    icon: "🟡",
  },
};

interface TiffinCardProps {
  listing: TiffinListing;
}

export default function TiffinCard({ listing }: TiffinCardProps) {
  const mainImage = listing.images?.[0] || "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=75";
  const food = foodTypeConfig[listing.foodType] || foodTypeConfig.veg;

  const meals = [
    listing.hasBreakfast && "Breakfast",
    listing.hasLunch && "Lunch",
    listing.hasDinner && "Dinner",
  ].filter(Boolean).join(" · ");

  return (
    <div className="card group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full overflow-hidden">
      <div>
        {/* Image Container - Compact & Proportional */}
        <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-gray-100 dark:bg-slate-800">
          <Image
            src={mainImage}
            alt={listing.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-sm backdrop-blur-md", food.lightClass, food.darkClass)}>
              {food.icon} {food.label}
            </span>
            {listing.isDemo && <span className="demo-badge text-[10px] px-2 py-0.5">Demo</span>}
          </div>

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            {listing.isVerified && <VerifiedBadge isVerified={listing.isVerified} />}
            <FavoriteButton listingId={listing._id} listingType="tiffin" size="sm" />
            <SaveButton listingId={listing._id} listingType="tiffin" size="sm" />
          </div>
        </div>

        {/* Content Body - Compact Spacing */}
        <div className="p-3.5 sm:p-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-1 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {listing.name}
          </h3>

          <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400 text-xs mb-2">
            <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
            <span className="truncate font-medium">{listing.area}, Nagpur</span>
          </div>

          {listing.avgRating > 0 && (
            <div className="mb-2.5">
              <RatingStars rating={listing.avgRating} totalReviews={listing.totalReviews} size="sm" />
            </div>
          )}

          <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
            <span className="bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 font-medium px-2 py-0.5 rounded-md border border-gray-100 dark:border-slate-700/60">
              🍱 {meals || "Daily Meals"}
            </span>
            {listing.hasDelivery && (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-900/60">
                <Truck className="w-3 h-3" /> Free Delivery
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price + CTA Footer */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {formatPrice(listing.monthlyPrice)}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-slate-400 ml-1">/mo</span>
          {listing.dailyPrice && (
            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
              {formatPrice(listing.dailyPrice)}/day
            </div>
          )}
        </div>
        <Link
          href={`/tiffins/${listing.slug}`}
          className="btn-primary text-xs px-3.5 py-1.5 font-semibold rounded-xl shadow-sm hover:shadow"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
