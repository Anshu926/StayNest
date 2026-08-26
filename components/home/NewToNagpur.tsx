import Link from "next/link";

const services = [
  { icon: "🏠", title: "Find a Place to Stay", description: "PGs, rooms, flats and hostels across Nagpur", href: "/stays", available: true },
  { icon: "🍱", title: "Find Home Food", description: "Fresh tiffin and home-cooked meal services", href: "/tiffins", available: true },
  { icon: "🗺️", title: "Explore Nagpur Areas", description: "Discover the best neighbourhoods for you", href: "/areas", available: true },
  { icon: "🧺", title: "Find Local Services", description: "Maid, cleaning and household services", href: "#", available: false },
  { icon: "🚚", title: "Moving Help", description: "Packers, movers and relocation services", href: "#", available: false },
  { icon: "📶", title: "Internet / Wi-Fi", description: "Broadband providers near you", href: "#", available: false },
  { icon: "🛵", title: "Bike Rental", description: "Short and long-term two-wheeler rentals", href: "#", available: false },
  { icon: "🤝", title: "Find a Flatmate", description: "Connect with people looking to share flats", href: "#", available: false },
];

export default function NewToNagpur() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-warm-50/50 via-white to-warm-50/30 dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-900/40 border-b border-gray-100 dark:border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="section-badge bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-900/60 text-primary-700 dark:text-primary-400">
            ✨ City Essentials
          </div>
          <h2 className="section-title mb-2">New to Nagpur?</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 max-w-lg mx-auto">
            Everything you need to relocate, explore, and settle comfortably in the Orange City.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {services.map((service) => (
            <div key={service.title} className="relative flex">
              {service.available ? (
                <Link
                  href={service.href}
                  className="w-full p-5 bg-white dark:bg-slate-900/90 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-warm-50 dark:bg-slate-800 flex items-center justify-center text-2xl mb-4 border border-gray-100 dark:border-slate-700/60 group-hover:scale-110 transition-transform">
                      {service.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                    Explore →
                  </div>
                </Link>
              ) : (
                <div className="w-full p-5 bg-gray-50/80 dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-800/60 opacity-75 cursor-default flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-4 grayscale opacity-80">
                      {service.icon}
                    </div>
                    <h3 className="font-semibold text-gray-700 dark:text-slate-300 text-sm mb-1.5">
                      {service.title}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed mb-3">
                      {service.description}
                    </p>
                  </div>
                  <div>
                    <span className="inline-block text-[11px] bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60">
                      Coming Soon
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
