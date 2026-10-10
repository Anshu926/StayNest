import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { StudySpace as StudySpaceModel } from "@/models/StudySpace";
import { Star, MapPin, Users, Wifi, Wind, ArrowRight } from "lucide-react";

async function getPopularStudySpaces() {
  try {
    await dbConnect();
    const spaces = await StudySpaceModel.find({ status: "active" })
      .sort({ avgRating: -1, totalReviews: -1 })
      .limit(6)
      .lean();
    return JSON.parse(JSON.stringify(spaces));
  } catch {
    return [];
  }
}

const SPACE_TYPE_LABELS: Record<string, string> = {
  library: "📚 Library",
  cafe: "☕ Study Café",
  coworking: "🖥️ Coworking",
  "private-room": "🚪 Private Room",
  "study-hall": "🏛️ Study Hall",
  "coaching-centre": "🎓 Coaching Centre",
};

export default async function PopularStudySpaces() {
  const spaces = await getPopularStudySpaces();

  if (spaces.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="section-badge bg-violet-50 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-900/60 text-violet-700 dark:text-violet-400">
              📚 Focused Learning
            </div>
            <h2 className="section-title">Top Study Rooms & Spaces</h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1.5">
              Verified libraries, silent study halls, and 24/7 coworking hubs for exam prep and deep work.
            </p>
          </div>
          <Link href="/study-spaces" className="btn-secondary self-start sm:self-auto text-sm px-4 py-2 flex items-center gap-1.5">
            View All Study Spaces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space: any) => {
            const image = space.images?.[0] || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80";
            const price = space.hourlyPrice && space.hourlyPrice > 0 
              ? `₹${space.hourlyPrice}/hr` 
              : space.dailyPrice && space.dailyPrice > 0 
              ? `₹${space.dailyPrice}/day` 
              : space.monthlyPrice && space.monthlyPrice > 0 
              ? `₹${space.monthlyPrice}/mo` 
              : "Free / Café Order";

            return (
              <div
                key={space._id}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="relative h-44 overflow-hidden flex-shrink-0">
                  <img
                    src={image}
                    alt={space.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-gray-700 dark:text-slate-200 px-2.5 py-0.5 rounded-full shadow-sm border border-gray-100 dark:border-slate-700">
                      {SPACE_TYPE_LABELS[space.spaceType] || space.spaceType}
                    </span>
                    {space.is24Hours && (
                      <span className="text-xs font-bold bg-primary-500 text-white px-2 py-0.5 rounded-full">
                        24/7
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {space.name}
                    </h3>
                    {space.avgRating > 0 && (
                      <div className="flex items-center gap-1 flex-shrink-0 text-xs font-bold text-gray-700 dark:text-slate-300">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {space.avgRating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{space.area}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {space.totalSeats} seats
                    </span>
                    {space.hasWifi && (
                      <span className="flex items-center gap-1">
                        <Wifi className="w-3.5 h-3.5 text-primary-500" /> Wi-Fi
                      </span>
                    )}
                    {space.hasAC && (
                      <span className="flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-blue-500" /> AC
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{price}</span>
                      {space.monthlyPrice > 0 && space.hourlyPrice > 0 && (
                        <span className="text-[11px] text-gray-400 ml-1">· ₹{space.monthlyPrice}/mo</span>
                      )}
                    </div>
                    <Link
                      href="/study-spaces"
                      className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                    >
                      Explore Space →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
