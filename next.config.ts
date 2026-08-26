import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.peaceandplentyservices.in" },
      { protocol: "https", hostname: "**.jindalservices.org" },
      { protocol: "https", hostname: "**.wpstaging.com" },
      { protocol: "https", hostname: "**.wordpress.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Allow images from any .in domain (for local property services)
      { protocol: "https", hostname: "**.in" },
      // Allow images from any .org domain (for service organizations)
      { protocol: "https", hostname: "**.org" },
    ],
  },
};

export default nextConfig;
