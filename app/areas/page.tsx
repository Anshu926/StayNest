import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Area } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Areas in Nagpur | NagpurNest",
  description: "Discover the best areas and neighbourhoods in Nagpur for students and working professionals. Find PGs, rooms and tiffins by area.",
};

import { dbConnect } from "@/lib/db";
import { Area as AreaModel } from "@/models/Area";

async function getAreas(): Promise<Area[]> {
  try {
    await dbConnect();
    const areas = await AreaModel.find({}).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(areas));
  } catch { return []; }
}

export default async function AreasPage() {
  const areas = await getAreas();

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <Navbar />

      <div className="bg-gradient-to-b from-warm-50 via-white to-transparent dark:from-slate-900 dark:via-slate-950 dark:to-transparent py-14 px-4 border-b border-gray-100 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto text-center">
          <div className="section-badge bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400">
            🗺️ City Localities
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            Explore Nagpur's Neighbourhoods
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            Find the right area for your lifestyle — whether you are looking for student budget hubs, IT corridors near MIHAN, or vibrant central localities.
          </p>
        </div>
      </div>

      <section className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {areas.map((area) => (
              <Link
                key={area._id}
                href={`/areas/${area.slug}`}
                className="card group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-slate-800">
                    <Image
                      src={area.image || "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=75"}
                      alt={area.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <h2 className="absolute bottom-3 left-4 text-white font-heading font-bold text-xl group-hover:text-primary-300 transition-colors">
                      {area.name}
                    </h2>
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                      {area.description}
                    </p>
                    {area.popularFor.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {area.popularFor.map((tag) => (
                          <span
                            key={tag}
                            className="bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary-200/70 dark:border-primary-900/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 flex items-center text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                  View Stays & Tiffins in {area.name} →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
