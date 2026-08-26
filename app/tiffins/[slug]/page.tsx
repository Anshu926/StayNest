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
import { MapPin, Truck, CheckCircle2, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

import { dbConnect } from "@/lib/db";
import { TiffinListing as TiffinModel } from "@/models/TiffinListing";
import { User as UserModel } from "@/models/User";
import { ProviderProfile as ProviderProfileModel } from "@/models/ProviderProfile";
import { Review as ReviewModel } from "@/models/Review";

async function getTiffin(slug: string) {
  try {
    await dbConnect();
    const listing = await TiffinModel.findOne({ slug, status: "active" }).lean();
    if (!listing) return null;

    const providerUser = await UserModel.findById((listing as any).providerId).select("name email phone").lean();
    const providerProfile = await ProviderProfileModel.findOne({ userId: (listing as any).providerId }).lean();
    const reviews = await ReviewModel.find({ listingId: (listing as any)._id, isApproved: true })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    return {
      listing: {
        ...JSON.parse(JSON.stringify(listing)),
        provider: {
          name: (providerUser as any)?.name || "Provider",
          phone: (providerProfile as any)?.phone || (providerUser as any)?.phone || "",
          whatsapp: (providerProfile as any)?.whatsapp || (providerProfile as any)?.phone || (providerUser as any)?.phone || "",
          isVerified: (providerProfile as any)?.isVerified || false,
        },
      },
      reviews: JSON.parse(JSON.stringify(reviews)),
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTiffin(slug);
  if (!data) return { title: "Tiffin Not Found" };
  return {
    title: `${data.listing.name} — Tiffin in ${data.listing.area}, Nagpur`,
    description: data.listing.description.slice(0, 160),
  };
}

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

export default async function TiffinDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getTiffin(slug);
  if (!data) notFound();
  const { listing, reviews } = data;
  const food = foodTypeConfig[listing.foodType] || foodTypeConfig.veg;

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

        <nav className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-6 flex items-center gap-2">
          <a href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</a>
          <span>/</span>
          <a href="/tiffins" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Tiffin Services</a>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">{listing.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery images={listing.images} alt={listing.name} />

            <div className="card p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border shadow-sm backdrop-blur-md", food.lightClass, food.darkClass)}>
                  {food.icon} {food.label}
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
                    listingType="tiffin"
                    size="md"
                  />
                  <SaveButton
                    listingId={listing._id}
                    listingType="tiffin"
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

            <div className="card p-6 sm:p-7">
              <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-3">About this service</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed mb-6">{listing.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-gray-100 dark:border-slate-800">
                {[
                  { label: "Meals/Day", value: `${listing.mealsPerDay} meals` },
                  { label: "Breakfast", value: listing.hasBreakfast ? "✓ Included" : "✗ Not offered" },
                  { label: "Lunch", value: listing.hasLunch ? "✓ Included" : "✗ Not offered" },
                  { label: "Dinner", value: listing.hasDinner ? "✓ Included" : "✗ Not offered" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700/60">
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {listing.deliveryAreas && listing.deliveryAreas.length > 0 && (
              <div className="card p-6 sm:p-7">
                <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-500" /> Delivery Localities
                </h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {listing.deliveryAreas.map((area: string) => (
                    <span key={area} className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900 text-xs font-semibold px-3 py-1 rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
                {listing.deliveryCharge > 0 && (
                  <p className="text-xs text-gray-500 dark:text-slate-400">Delivery charge: {formatPrice(listing.deliveryCharge)}</p>
                )}
                {listing.deliveryCharge === 0 && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Free home delivery included
                  </p>
                )}
              </div>
            )}

            {listing.menuDescription && (
              <div className="card p-6 sm:p-7">
                <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-primary-500" /> Typical Menu
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{listing.menuDescription}</p>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection
              listingId={listing._id}
              listingType="tiffin"
              avgRating={listing.avgRating || 0}
              totalReviews={listing.totalReviews || 0}
              providerId={listing.providerId?.toString()}
            />
          </div>

          <div className="space-y-4">
            <div className="card p-6 sticky top-20 shadow-lg border border-gray-100 dark:border-slate-800">
              <div className="mb-5 pb-5 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(listing.monthlyPrice)}</span>
                  <span className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm">/month</span>
                </div>
                {listing.dailyPrice && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{formatPrice(listing.dailyPrice)}/day plan available</p>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/80 rounded-xl p-3.5 mb-5 border border-gray-100 dark:border-slate-700/60">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Delivery Status:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{listing.hasDelivery ? "🚚 Home Delivery" : "📦 Pickup Only"}</span>
                </p>
              </div>

              <ContactForm
                listingId={listing._id}
                listingType="tiffin"
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
