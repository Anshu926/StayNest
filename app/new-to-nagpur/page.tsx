import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New to the City? Your Complete Guide | StayNest",
  description: "A complete guide for newcomers — find accommodation, home food, quiet study spaces, and discover everything you need to settle in comfortably.",
};

const guides = [
  {
    emoji: "🏠",
    title: "Finding a PG or Room",
    description: "Tips on choosing the right PG or flat based on your budget, area, and lifestyle. Know what to check before signing the agreement.",
    steps: [
      "Decide your preferred area based on your college or office location",
      "Set a realistic budget (₹4,000–₹15,000 for most PGs)",
      "Check for Wi-Fi, food, security, and bathroom facilities",
      "Always visit in person before paying any advance",
      "Clarify the notice period and deposit refund policy",
    ],
    cta: { label: "Browse PGs & Rooms", href: "/stays" },
  },
  {
    emoji: "🍱",
    title: "Getting Home Food / Tiffin",
    description: "Tiffin services are the most affordable and convenient way to get fresh, hygienic home-cooked meals every day.",
    steps: [
      "Look for services that deliver to your area",
      "Check if they offer trial meals before subscribing",
      "Confirm food type (Pure Veg / Non-Veg / Jain)",
      "Ask about monthly rates and weekend delivery options",
      "Check reviews and hygiene before subscribing",
    ],
    cta: { label: "Find Tiffin Services", href: "/tiffins" },
  },
  {
    emoji: "📚",
    title: "Finding Quiet Study Spaces",
    description: "Whether you're preparing for competitive exams, attending online lectures, or doing focused work, here's how to pick the best study space.",
    steps: [
      "Choose based on noise requirement (Silent, Quiet, or Moderate)",
      "Verify essential amenities: high-speed Wi-Fi, power outlets, AC",
      "Look for flexible access: hourly passes, daily desks, or monthly cabins",
      "Check for 24/7 access if you prefer night study hours",
      "Inspect locker and printing availability for study materials",
    ],
    cta: { label: "Browse Study Spaces", href: "/study-spaces" },
  },
];

const faqs = [
  { q: "What is the average PG rent in Nagpur?", a: "PG rents in Nagpur typically range from ₹4,000 to ₹15,000 per month depending on the area, amenities, and occupancy type. Student areas like Laxmi Nagar and Manish Nagar are more affordable." },
  { q: "Which area is best for students in Nagpur?", a: "Laxmi Nagar, Manish Nagar, and Dharampeth are popular among students due to proximity to colleges, affordable PGs, and good amenities." },
  { q: "Which area is best for IT professionals?", a: "Wardha Road and MIHAN are ideal for IT and corporate employees. Civil Lines and Dharampeth are also popular for professionals who prefer a premium environment." },
  { q: "How much does a tiffin service cost in Nagpur?", a: "Tiffin services in Nagpur range from ₹1,500 to ₹4,000 per month for 2 meals a day. Premium services with variety can cost more." },
  { q: "Is food included in most PGs in Nagpur?", a: "Not always. Some PGs include food in the rent while others don't. Always confirm this before booking. If food is not included, tiffin services are a great option." },
];

export default function NewToNagpurPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <Navbar />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-950 to-slate-950 text-white py-20 px-4 overflow-hidden">
        <div className="ambient-glow-orange top-0 right-1/4 w-[400px] h-[400px] opacity-20" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            ✨ Complete Relocation Handbook
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-5 tracking-tight">
            New to the City?
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Moving to a new city shouldn't be overwhelming. StayNest is your comprehensive local companion for finding verified stays, wholesome food, and settling in with confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link href="/stays" className="btn-primary px-6 py-3 font-semibold">
              Find a Stay →
            </Link>
            <Link
              href="/tiffins"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
            >
              Find Tiffin Delivery
            </Link>
          </div>
        </div>
      </div>

      {/* Guides */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/60">
        <div className="max-w-4xl mx-auto space-y-10">
          {guides.map((guide) => (
            <div
              key={guide.title}
              className="card p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-warm-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-3xl mb-5">
                {guide.emoji}
              </div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {guide.title}
              </h2>
              <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
                {guide.description}
              </p>
              <ul className="space-y-3 mb-8">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-slate-300">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-900/60 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 leading-snug">{step}</span>
                  </li>
                ))}
              </ul>
              <Link href={guide.cta.href} className="btn-primary text-xs sm:text-sm font-semibold">
                {guide.cta.label} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-warm-50/50 dark:bg-slate-900/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-badge bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-900/60 text-primary-700 dark:text-primary-400">
              💡 Questions Answered
            </div>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6"
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">
                  {faq.q}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
