import Link from "next/link";
import { MapPin, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-warm">
                <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-heading text-xl font-bold text-white">
                Stay<span className="text-primary-500">Nest</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Find your ideal stay and wholesome daily meals effortlessly. Discover trusted PGs, shared rooms, flats, and home-cooked tiffins.
            </p>
            <div className="flex gap-2.5">
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Verified Across Top Cities
              </span>
            </div>
          </div>

          {/* Find */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">
              Find Accommodation & Food
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Verified PGs", href: "/stays?propertyType=pg" },
                { label: "Single & Shared Rooms", href: "/stays?propertyType=single-room" },
                { label: "Rental Flats", href: "/stays?propertyType=flat" },
                { label: "Student Hostels", href: "/stays?propertyType=hostel" },
                { label: "Daily Meal & Tiffins", href: "/tiffins" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-primary-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Areas */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">
              Popular Localities
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Manish Nagar", href: "/areas/manish-nagar" },
                { label: "Dharampeth", href: "/areas/dharampeth" },
                { label: "Wardha Road", href: "/areas/wardha-road" },
                { label: "MIHAN Tech Zone", href: "/areas/mihan" },
                { label: "Laxmi Nagar", href: "/areas/laxmi-nagar" },
                { label: "Sadar", href: "/areas/sadar" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-primary-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Providers & Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">
              For Property & Food Owners
            </h3>
            <ul className="space-y-2.5 text-sm mb-6">
              {[
                { label: "List PG / Room", href: "/list-your-service" },
                { label: "List Tiffin Delivery", href: "/list-your-service" },
                { label: "Provider Dashboard", href: "/provider/dashboard" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-primary-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div>
              <a
                href="mailto:hello@staynest.in"
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-primary-400" />
                hello@staynest.in
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} StayNest. Accommodation and Meal Booking Platform.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
