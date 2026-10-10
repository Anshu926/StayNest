import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Building2, UtensilsCrossed, Home, Bed, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your PG, Room, Tiffin or Study Space | StayNest",
  description: "List your PG, flat, tiffin service, or study space on StayNest and connect with thousands of students and working professionals.",
};

const listingTypes = [
  { icon: Building2, title: "PG Accommodation", description: "List your paying guest accommodation with all amenities.", type: "pg" },
  { icon: Home, title: "Flat / Apartment", description: "Rent out your flat or apartment to tenants.", type: "flat" },
  { icon: UtensilsCrossed, title: "Tiffin / Home Food", description: "Offer your home-cooked meals and tiffin delivery service.", type: "tiffin" },
  { icon: Bed, title: "Study Space / Library", description: "List your reading room, library, or coworking space.", type: "study-space" },
];

export default function ListYourServicePage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="bg-gradient-to-br from-warm-50 to-white dark:from-slate-900 dark:to-slate-950 py-14 px-4 text-center border-b border-gray-100 dark:border-slate-800/60 transition-colors">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          List Your Service on StayNest
        </h1>
        <p className="text-gray-600 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
          Reach thousands of newcomers who are actively looking for accommodation, home food, and study spaces. It's free to get started.
        </p>
      </div>

      <section className="py-14 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            What would you like to list?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {listingTypes.map((item) => (
              <Link
                key={item.type}
                href={`/register?role=provider&type=${item.type}`}
                className="card p-6 flex items-start gap-4 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/60 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                  <item.icon className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors flex-shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-secondary-50 dark:bg-slate-900 rounded-3xl p-8 border border-secondary-100 dark:border-slate-800 shadow-sm transition-colors">
            <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-5 text-center">Why list on StayNest?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { emoji: "🎯", title: "Targeted Audience", desc: "Connect with students, professionals and newcomers who are actively searching." },
                { emoji: "✅", title: "Verified Listings", desc: "Get a Verified badge that builds trust and drives more inquiries." },
                { emoji: "📊", title: "Lead Dashboard", desc: "Manage all your inquiries and leads from a clean provider dashboard." },
              ].map((b) => (
                <div key={b.title} className="text-center">
                  <div className="text-3xl mb-2">{b.emoji}</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{b.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
