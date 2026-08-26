import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageGallery from "@/components/shared/ImageGallery";
import VerifiedBadge from "@/components/shared/VerifiedBadge";
import RatingStars from "@/components/shared/RatingStars";
import ContactForm from "@/components/shared/ContactForm";
import ReviewSection from "@/components/shared/ReviewSection";
import FavoriteButton from "@/components/shared/FavoriteButton";
import SaveButton from "@/components/shared/SaveButton";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import { formatPrice } from "@/lib/utils";
import ProviderListingControls from "@/components/provider/ProviderListingControls";
import {
  MapPin, Wifi, Wind, Utensils, WashingMachine, Car,
  Bath, CheckCircle2, XCircle, Phone, MessageSquare, Calendar,
  Users, Home, Shield
} from "lucide-react";
import type { Metadata } from "next";

async function getStay(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stays/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStay(slug);
  if (!data) return { title: "Stay Not Found" };
  const { listing } = data;
  return {
    title: `${listing.name} — ${listing.area}, Nagpur`,
    description: listing.description.slice(0, 160),
  };
}

const propertyTypeLabel: Record<string, string> = {
  pg: "PG", flat: "Flat", hostel: "Hostel",
  "single-room": "Single Room", "shared-room": "Shared Room",
};

const AmenityIcon: Record<string, React.ReactNode> = {
  "Wi-Fi": <Wifi className="w-4 h-4" />,
  "AC": <Wind className="w-4 h-4" />,
  "Food Included": <Utensils className="w-4 h-4" />,
  "Laundry": <WashingMachine className="w-4 h-4" />,
  "Parking": <Car className="w-4 h-4" />,
  "Attached Bathroom": <Bath className="w-4 h-4" />,
};

export default async function StayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getStay(slug);
  if (!data) notFound();

  const { listing, reviews } = data;

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Provider Controls banner if logged in as owner */}
        <ProviderListingControls
          listingId={listing._id}
          providerId={listing.providerId}
          listingName={listing.name}
        />

        {/* Breadcrumb */}
        <nav className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-6 flex items-center gap-2">
          <a href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</a>
          <span>/</span>
          <a href="/stays" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Stays</a>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">{listing.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={listing.images} alt={listing.name} />

            {/* Header */}
            <div className="card p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-full border border-gray-200/60 dark:border-slate-700">
                  {propertyTypeLabel[listing.propertyType]}
                </span>
                <VerifiedBadge isVerified={listing.isVerified} size="md" />
                {listing.isDemo && <span className="demo-badge">Demo Listing</span>}
              </div>

              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                  {listing.name}
                </h1>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FavoriteButton
                    listingId={listing._id}
                    listingType="stay"
                    size="md"
                  />
                  <SaveButton
                    listingId={listing._id}
                    listingType="stay"
                    size="md"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 text-sm mb-4">
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>{listing.address || `${listing.area}, Nagpur`}</span>
              </div>

              {listing.avgRating > 0 && (
                <RatingStars rating={listing.avgRating} totalReviews={listing.totalReviews} size="md" />
              )}
            </div>

            {/* Description */}
            <div className="card p-6 sm:p-7">
              <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-3">About this property</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed">{listing.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                {[
                  { icon: Home, label: "Type", value: propertyTypeLabel[listing.propertyType] },
                  { icon: Users, label: "Occupancy", value: listing.roomType },
                  { icon: Shield, label: "For", value: listing.targetAudience === "any" ? "All" : listing.targetAudience },
                  { icon: Calendar, label: "Available", value: listing.isAvailable ? "Immediate" : "Check with owner" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700/60">
                    <item.icon className="w-5 h-5 text-primary-500 mx-auto mb-1.5" />
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{item.label}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="card p-6 sm:p-7">
              <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-4">Amenities & Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Wi-Fi", active: listing.hasWifi },
                  { label: "AC", active: listing.isAC },
                  { label: "Food Included", active: listing.isFoodIncluded },
                  { label: "Furnished", active: listing.isFurnished },
                  { label: "Laundry", active: listing.hasLaundry },
                  { label: "Parking", active: listing.hasParking },
                  { label: "Attached Bathroom", active: listing.hasAttachedBathroom },
                  ...listing.amenities.slice(0, 5).map((a: string) => ({ label: a, active: true })),
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs sm:text-sm font-medium border ${
                      item.active
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
                        : "bg-gray-50 dark:bg-slate-800/60 border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500"
                    }`}
                  >
                    {item.active
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                    }
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            {listing.rules && listing.rules.length > 0 && (
              <div className="card p-6 sm:p-7">
                <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-4">House Rules & Policy</h2>
                <ul className="space-y-2.5">
                  {listing.rules.map((rule: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection
              listingId={listing._id}
              listingType="stay"
              avgRating={listing.avgRating || 0}
              totalReviews={listing.totalReviews || 0}
              providerId={listing.providerId?.toString()}
            />
          </div>

          {/* Right: Booking panel */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="card p-6 sticky top-20 shadow-lg border border-gray-100 dark:border-slate-800">
              <div className="mb-5 pb-5 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(listing.monthlyRent)}</span>
                  <span className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm">/month</span>
                </div>
                {listing.depositAmount > 0 && (
                  <p className="text-xs text-gray-500 dark:text-slate-400">Security deposit: {formatPrice(listing.depositAmount)}</p>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/80 rounded-xl p-3.5 mb-5 text-xs sm:text-sm text-gray-600 dark:text-slate-300 space-y-1.5 border border-gray-100 dark:border-slate-700/60">
                <p className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Gender Preference:</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">{listing.genderPreference === "any" ? "Co-ed" : listing.genderPreference}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Room Arrangement:</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">{listing.roomType}</span>
                </p>
              </div>

              <ContactForm
                listingId={listing._id}
                listingType="stay"
                providerId={listing.providerId?.toString()}
              />

              {listing.provider?.whatsapp && (
                <WhatsAppButton
                  whatsapp={listing.provider.whatsapp}
                  listingName={listing.name}
                  providerId={listing.providerId?.toString()}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
