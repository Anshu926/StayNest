import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import PopularAreas from "@/components/home/PopularAreas";
import PopularStays from "@/components/home/PopularStays";
import PopularTiffins from "@/components/home/PopularTiffins";
import NewToNagpur from "@/components/home/NewToNagpur";
import ListYourService from "@/components/home/ListYourService";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NagpurNest — Find PGs, Rooms & Tiffin in Nagpur",
  description:
    "Your first step after moving to Nagpur. Find trusted PGs, rental rooms, flats and tiffin services across Nagpur. Perfect for students and corporate employees.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <HeroSection />

      <Suspense fallback={<SectionSkeleton />}>
        <PopularAreas />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <PopularStays />
      </Suspense>

      <NewToNagpur />

      <Suspense fallback={<SectionSkeleton />}>
        <PopularTiffins />
      </Suspense>

      <ListYourService />

      <Footer />
    </main>
  );
}

function SectionSkeleton() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="skeleton h-8 w-64 mb-8 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}
