import Link from "next/link";
import { Building2, UtensilsCrossed, Home, ChevronRight } from "lucide-react";

export default function ListYourService() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white overflow-hidden">
      {/* Subtle orange mesh glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5">
              🚀 For Owners & Providers
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Have a PG, Room,<br />or Tiffin Service?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
              List your property or food delivery on NagpurNest. Connect directly with students and professionals moving to Nagpur every single day.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5">
              <Link
                href="/list-your-service"
                className="btn-primary text-sm px-6 py-3.5 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-primary-500/30"
              >
                List Your Service Now
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register?role=provider"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-colors"
              >
                Create Provider Account
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Building2, title: "PG / Room", desc: "List single, double, or full-room accommodations" },
              { icon: Home, title: "Flat / Hostel", desc: "List flats and hostels for student/corporate tenants" },
              { icon: UtensilsCrossed, title: "Tiffin Service", desc: "Connect with subscribers needing fresh daily meals" },
            ].map((item) => (
              <Link
                key={item.title}
                href="/list-your-service"
                className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 text-center hover:bg-slate-800/90 transition-all group border border-slate-800 hover:border-primary-500/60 hover:-translate-y-1 shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-primary-500/20 transition-all">
                  <item.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
