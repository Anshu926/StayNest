import Image from "next/image";
import Link from "next/link";
import { Area } from "@/types";

async function getAreas(): Promise<Area[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/areas`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function PopularAreas() {
  const areas = await getAreas();

  if (areas.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="section-badge bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400">
              🗺️ Neighborhoods
            </div>
            <h2 className="section-title">Popular Areas in Nagpur</h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1.5">
              Discover top student hubs, tech corridors, and residential neighborhoods.
            </p>
          </div>
          <Link href="/areas" className="btn-secondary self-start sm:self-auto text-sm px-4 py-2">
            View All 12 Areas →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {areas.slice(0, 12).map((area) => (
            <Link
              key={area._id}
              href={`/areas/${area.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-gray-100 dark:border-slate-800"
            >
              <Image
                src={area.image || "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=75"}
                alt={area.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
              
              <div className="absolute bottom-0 left-0 right-0 p-3.5 flex flex-col justify-end">
                <p className="text-white font-bold text-sm leading-snug group-hover:text-primary-300 transition-colors">
                  {area.name}
                </p>
                {area.popularFor.length > 0 && (
                  <span className="inline-block text-white/75 text-[11px] mt-1 truncate">
                    {area.popularFor[0]}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 sm:hidden text-center">
          <Link href="/areas" className="btn-secondary w-full text-sm py-2.5">
            View All Areas
          </Link>
        </div>
      </div>
    </section>
  );
}
