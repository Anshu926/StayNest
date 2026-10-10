import { Inter, Lora } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StayNest — Accommodation, Meal & Study Spaces Platform",
    template: "%s | StayNest",
  },
  description:
    "StayNest is your trusted platform for accommodation, home-cooked meal subscriptions, and quiet study spaces. Discover verified PGs, rental rooms, flats, tiffin deliveries, and libraries effortlessly.",
  keywords: [
    "PG booking",
    "rooms for rent",
    "tiffin service",
    "study rooms",
    "libraries and study halls",
    "coworking spaces",
    "accommodation booking platform",
    "rental flats",
    "student hostels",
    "daily meals",
    "StayNest",
  ],
  openGraph: {
    title: "StayNest — Accommodation, Meal & Study Spaces Platform",
    description: "Discover verified PGs, rental rooms, flats, home-cooked meal services, and quiet study spaces effortlessly.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent theme flash on initial load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('staynest-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="font-sans bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
