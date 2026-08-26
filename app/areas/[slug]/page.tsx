import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ListingCard from "@/components/listings/ListingCard";
import TiffinCard from "@/components/listings/TiffinCard";
import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import type { Area, StayListing, TiffinListing } from "@/types";

type AreaDetailData = {
  area: Area;
  stays: StayListing[];
  tiffins: TiffinListing[];
};

import { dbConnect } from "@/lib/db";
import { Area as AreaModel } from "@/models/Area";
import { StayListing as StayModel } from "@/models/StayListing";
import { TiffinListing as TiffinModel } from "@/models/TiffinListing";

async function getArea(slug: string): Promise<AreaDetailData | null> {
  try {
    await dbConnect();
    const area = await AreaModel.findOne({ slug }).lean();
    if (!area) return null;

    const [stays, tiffins] = await Promise.all([
      StayModel.find({ areaSlug: slug, status: "active" }).sort({ avgRating: -1 }).lean(),
      TiffinModel.find({ areaSlug: slug, status: "active" }).sort({ avgRating: -1 }).lean(),
    ]);

    return {
      area: JSON.parse(JSON.stringify(area)),
      stays: JSON.parse(JSON.stringify(stays)),
      tiffins: JSON.parse(JSON.stringify(tiffins)),
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArea(slug);
  if (!data) return { title: "Area Not Found" };
  return {
    title: `PGs & Tiffin in ${data.area.name}, Nagpur | StayNest`,
    description: `Find PGs, rooms and tiffin services in ${data.area.name}, Nagpur. ${data.area.description}`,
  };
}

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getArea(slug);
  if (!data) notFound();
  const { area, stays, tiffins } = data;

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors">
      <Navbar />

      {/* Hero */}
      <div className="relative h-56 md:h-72">
        <Image
          src={
            area.image ||
            "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80"
          }
          alt={area.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <nav className="text-white/70 text-sm mb-2 flex items-center gap-2">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/areas" className="hover:text-white">
              Areas
            </Link>
            <span>/</span>
            <span className="text-white">{area.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-400" />
            <h1 className="font-heading text-3xl md:text-4xl font-semibold text-white">
              {area.name}
            </h1>
          </div>
          {area.popularFor.length > 0 && (
            <div className="flex gap-2 mt-2">
              {area.popularFor.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <p className="text-gray-600 dark:text-slate-300 text-lg max-w-3xl mb-10 leading-relaxed">
          {area.description}
        </p>

        {stays.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-2xl font-semibold text-gray-900 dark:text-white">
                Stays in {area.name}
              </h2>
              <Link
                href={`/stays?area=${slug}`}
                className="btn-secondary text-sm px-4 py-2"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {stays.map((listing: StayListing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {tiffins.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-2xl font-semibold text-gray-900 dark:text-white">
                Tiffin Services in {area.name}
              </h2>
              <Link
                href={`/tiffins?area=${slug}`}
                className="btn-secondary text-sm px-4 py-2"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tiffins.map((listing: TiffinListing) => (
                <TiffinCard key={listing._id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {stays.length === 0 && tiffins.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🗺️</div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No listings yet in {area.name}
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mb-4">
              Be the first to list your service here!
            </p>
            <Link href="/list-your-service" className="btn-primary">
              List Your Service
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
