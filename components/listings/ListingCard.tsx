import Image from "next/image";
import Link from "next/link";
import { MapPin, Wifi, Wind, Utensils, WashingMachine } from "lucide-react";
import { StayListing } from "@/types";
import { formatPrice } from "@/lib/utils";
import VerifiedBadge from "@/components/shared/VerifiedBadge";
import RatingStars from "@/components/shared/RatingStars";
import FavoriteButton from "@/components/shared/FavoriteButton";
import SaveButton from "@/components/shared/SaveButton";

const propertyTypeLabel: Record<string, string> = {
  pg: "PG",
  flat: "Flat",
  hostel: "Hostel",
  "single-room": "Single Room",
  "shared-room": "Shared Room",
};

const genderLabel: Record<string, string> = {
  male: "Boys",
  female: "Girls",
  any: "Co-ed",
};

interface ListingCardProps {
  listing: StayListing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.images?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=75";

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

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-gray-800 dark:text-slate-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm border border-black/5 dark:border-white/10">
              {propertyTypeLabel[listing.propertyType] || listing.propertyType}
            </span>
            {listing.isDemo && <span className="demo-badge text-[10px] px-2 py-0.5">Demo</span>}
          </div>

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            {listing.isVerified && <VerifiedBadge isVerified={listing.isVerified} />}
            <FavoriteButton listingId={listing._id} listingType="stay" size="sm" />
            <SaveButton listingId={listing._id} listingType="stay" size="sm" />
          </div>

          <div className="absolute bottom-2.5 left-2.5">
            <span className="bg-primary-500/95 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
              {genderLabel[listing.genderPreference]}
            </span>
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

          {/* Amenity chips */}
          <div className="flex items-center flex-wrap gap-1.5 text-gray-600 dark:text-slate-300 text-[11px]">
            {listing.hasWifi && (
              <span className="inline-flex items-center gap-1 bg-gray-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-gray-100 dark:border-slate-700/60 font-medium">
                <Wifi className="w-3 h-3 text-primary-500" /> Wi-Fi
              </span>
            )}
            {listing.isAC && (
              <span className="inline-flex items-center gap-1 bg-gray-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-gray-100 dark:border-slate-700/60 font-medium">
                <Wind className="w-3 h-3 text-blue-500" /> AC
              </span>
            )}
            {listing.isFoodIncluded && (
              <span className="inline-flex items-center gap-1 bg-gray-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-gray-100 dark:border-slate-700/60 font-medium">
                <Utensils className="w-3 h-3 text-emerald-500" /> Food
              </span>
            )}
            {listing.hasLaundry && (
              <span className="inline-flex items-center gap-1 bg-gray-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-gray-100 dark:border-slate-700/60 font-medium">
                <WashingMachine className="w-3 h-3 text-purple-500" /> Laundry
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price + CTA Footer */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {formatPrice(listing.monthlyRent)}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-slate-400 ml-1">/mo</span>
        </div>
        <Link
          href={`/stays/${listing.slug}`}
          className="btn-primary text-xs px-3.5 py-1.5 font-semibold rounded-xl shadow-sm hover:shadow"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
