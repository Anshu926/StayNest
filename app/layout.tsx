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
    default: "NagpurNest — Find PGs, Rooms & Tiffin in Nagpur",
    template: "%s | NagpurNest",
  },
  description:
    "NagpurNest helps newcomers in Nagpur find trusted PGs, rental rooms, flats, and tiffin services. Everything you need to settle into Nagpur.",
  keywords: [
    "PG in Nagpur",
    "rooms for rent Nagpur",
    "tiffin service Nagpur",
    "accommodation Nagpur",
    "flat for rent Nagpur",
    "hostel Nagpur",
    "newcomers Nagpur",
  ],
  openGraph: {
    title: "NagpurNest — Find PGs, Rooms & Tiffin in Nagpur",
    description: "Everything you need to settle into Nagpur.",
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
                  var saved = localStorage.getItem('nagpurnest-theme');
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
