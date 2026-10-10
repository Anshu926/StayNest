import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { TiffinListing } from "@/models/TiffinListing";

const tiffinImages = [
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
  "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?w=800&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=800&q=80",
  "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80",
  "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
];

const DEMO_TIFFINS = [
  {
    name: "Sunita Home Kitchen",
    slug: "sunita-home-kitchen-manish-nagar",
    description: "Authentic Maharashtrian home food prepared fresh every day. Dal, rice, sabzi, chapati, and pickle. Tastes like mom's cooking!",
    area: "Manish Nagar", areaSlug: "manish-nagar",
    deliveryAreas: ["Manish Nagar", "Trimurti Nagar", "Bajaj Nagar"],
    foodType: "veg", mealsPerDay: 2, hasBreakfast: false, hasLunch: true, hasDinner: true,
    monthlyPrice: 2500, dailyPrice: 100, hasDelivery: true, deliveryCharge: 0,
    menuDescription: "Dal Tadka, Jeera Rice, 2 Sabzis, 6 Chapatis, Salad, Buttermilk",
    images: [tiffinImages[0], tiffinImages[3]],
    isVerified: true, verificationStatus: "approved", isDemo: true,
    avgRating: 4.7, totalReviews: 23, status: "active",
  },
  {
    name: "Wardha Road Tiffin",
    slug: "wardha-road-tiffin",
    description: "Fresh and hygienic tiffin service for corporate professionals on Wardha Road. Monthly subscription with unlimited roti option.",
    area: "Wardha Road", areaSlug: "wardha-road",
    deliveryAreas: ["Wardha Road", "MIHAN", "Koradi Road"],
    foodType: "veg-nonveg", mealsPerDay: 2, hasBreakfast: false, hasLunch: true, hasDinner: true,
    monthlyPrice: 3000, dailyPrice: 120, hasDelivery: true, deliveryCharge: 50,
    menuDescription: "Choice of Veg or Non-Veg. Dal, Rice, Curry, Rotis, Salad. Non-veg 3 days/week.",
    images: [tiffinImages[1], tiffinImages[4]],
    isVerified: true, verificationStatus: "approved", isDemo: true,
    avgRating: 4.5, totalReviews: 18, status: "active",
  },
  {
    name: "Jain Tiffin Service",
    slug: "jain-tiffin-service-dharampeth",
    description: "Pure Jain tiffin — no onion, no garlic, no root vegetables. Fresh, sattvic food prepared with care. Delivery across Dharampeth.",
    area: "Dharampeth", areaSlug: "dharampeth",
    deliveryAreas: ["Dharampeth", "Civil Lines", "Sadar"],
    foodType: "jain", mealsPerDay: 2, hasBreakfast: false, hasLunch: true, hasDinner: true,
    monthlyPrice: 2800, dailyPrice: 110, hasDelivery: true, deliveryCharge: 0,
    menuDescription: "No onion/garlic. Jain Dal, Sabzi, Phulka, Rice, Papad, Pickle.",
    images: [tiffinImages[2], tiffinImages[6]],
    isVerified: true, verificationStatus: "approved", isDemo: true,
    avgRating: 4.8, totalReviews: 15, status: "active",
  },
  {
    name: "Laxmi Nagar Student Tiffin",
    slug: "laxmi-nagar-student-tiffin",
    description: "Budget tiffin for students near Laxmi Nagar colleges. Tasty and filling. Weekly menu rotation keeps it interesting.",
    area: "Laxmi Nagar", areaSlug: "laxmi-nagar",
    deliveryAreas: ["Laxmi Nagar", "Dharampeth", "Sadar"],
    foodType: "veg", mealsPerDay: 2, hasBreakfast: false, hasLunch: true, hasDinner: true,
    monthlyPrice: 1800, dailyPrice: 75, hasDelivery: true, deliveryCharge: 0,
    menuDescription: "Simple home-style. Dal, Sabzi, 4 Rotis, Rice, Salad. Rotating weekly menu.",
    images: [tiffinImages[3], tiffinImages[0]],
    isVerified: true, verificationStatus: "approved", isDemo: true,
    avgRating: 4.3, totalReviews: 31, status: "active",
  },
  {
    name: "Sadar 3-Meal Tiffin",
    slug: "sadar-3-meal-tiffin",
    description: "Full-day tiffin covering breakfast, lunch, and dinner. Ideal for people who want complete meal coverage. Veg only.",
    area: "Sadar", areaSlug: "sadar",
    deliveryAreas: ["Sadar", "Sitabuldi", "Civil Lines", "Dharampeth"],
    foodType: "veg", mealsPerDay: 3, hasBreakfast: true, hasLunch: true, hasDinner: true,
    monthlyPrice: 3500, dailyPrice: 140, hasDelivery: true, deliveryCharge: 0,
    menuDescription: "Breakfast: Poha/Upma/Idli. Lunch: Full thali. Dinner: Dal, Rice, Sabzi, Rotis.",
    images: [tiffinImages[4], tiffinImages[1]],
    isVerified: true, verificationStatus: "approved", isDemo: true,
    avgRating: 4.6, totalReviews: 19, status: "active",
  },
  {
    name: "MIHAN Office Tiffin",
    slug: "mihan-office-tiffin",
    description: "Tiffin service specially designed for MIHAN corporate employees. Delivers to office buildings and PGs in the SEZ.",
    area: "MIHAN", areaSlug: "mihan",
    deliveryAreas: ["MIHAN", "Wardha Road"],
    foodType: "veg-nonveg", mealsPerDay: 1, hasBreakfast: false, hasLunch: true, hasDinner: false,
    monthlyPrice: 1500, dailyPrice: 65, hasDelivery: true, deliveryCharge: 0,
    menuDescription: "Lunch box: 2 rotis, dal, sabzi, rice, salad. Non-veg extra.",
    images: [tiffinImages[5], tiffinImages[7]],
    isVerified: true, verificationStatus: "approved", isDemo: true,
    avgRating: 4.2, totalReviews: 14, status: "active",
  },
  {
    name: "Bajaj Nagar Home Food",
    slug: "bajaj-nagar-home-food",
    description: "Home-style cooking by a homemaker. Limited slots available. Tastes exactly like home. Very hygienic.",
    area: "Bajaj Nagar", areaSlug: "bajaj-nagar",
    deliveryAreas: ["Bajaj Nagar", "Trimurti Nagar", "Hingna"],
    foodType: "veg", mealsPerDay: 2, hasBreakfast: false, hasLunch: true, hasDinner: true,
    monthlyPrice: 2200, dailyPrice: 90, hasDelivery: false, deliveryCharge: 0,
    menuDescription: "Pick-up only. Fresh Maharashtrian food. Limited to 10 customers.",
    images: [tiffinImages[6], tiffinImages[2]],
    isVerified: false, verificationStatus: "pending", isDemo: true,
    avgRating: 4.9, totalReviews: 8, status: "active",
  },
  {
    name: "Pratap Nagar Lunch Box",
    slug: "pratap-nagar-lunch-box",
    description: "Office lunch box service from Pratap Nagar. Healthy, hygienic, and on-time delivery guaranteed.",
    area: "Pratap Nagar", areaSlug: "pratap-nagar",
    deliveryAreas: ["Pratap Nagar", "Manish Nagar", "Hingna"],
    foodType: "veg", mealsPerDay: 1, hasBreakfast: false, hasLunch: true, hasDinner: false,
    monthlyPrice: 1400, dailyPrice: 60, hasDelivery: true, deliveryCharge: 20,
    menuDescription: "Compact lunch box: 2 rotis, 1 sabzi, dal, rice. Low oil.",
    images: [tiffinImages[7], tiffinImages[5]],
    isVerified: true, verificationStatus: "approved", isDemo: true,
    avgRating: 4.4, totalReviews: 11, status: "active",
  },
  {
    name: "Civil Lines Premium Tiffin",
    slug: "civil-lines-premium-tiffin",
    description: "Premium tiffin with variety. Includes soup, salad, full thali. For health-conscious professionals.",
    area: "Civil Lines", areaSlug: "civil-lines",
    deliveryAreas: ["Civil Lines", "Sadar", "Dharampeth"],
    foodType: "veg", mealsPerDay: 2, hasBreakfast: false, hasLunch: true, hasDinner: true,
    monthlyPrice: 4000, dailyPrice: 160, hasDelivery: true, deliveryCharge: 0,
    menuDescription: "Premium thali: Soup, Salad, 2 Sabzi, Dal Makhani, Roti, Rice, Dessert (twice weekly).",
    images: [tiffinImages[0], tiffinImages[4]],
    isVerified: true, verificationStatus: "approved", isDemo: true,
    avgRating: 4.7, totalReviews: 9, status: "active",
  },
  {
    name: "Hingna Dhaba-Style Tiffin",
    slug: "hingna-dhaba-style-tiffin",
    description: "Dhaba-style hearty food for industrial workers. Heavy meals, great taste, affordable prices. Non-veg available on weekends.",
    area: "Hingna", areaSlug: "hingna",
    deliveryAreas: ["Hingna", "Bajaj Nagar"],
    foodType: "veg-nonveg", mealsPerDay: 2, hasBreakfast: false, hasLunch: true, hasDinner: true,
    monthlyPrice: 2000, dailyPrice: 85, hasDelivery: true, deliveryCharge: 0,
    menuDescription: "Dhaba thali: Dal, 2 Sabzi, Unlimited Rotis, Rice, Achaar. Non-veg weekends.",
    images: [tiffinImages[3], tiffinImages[1]],
    isVerified: true, verificationStatus: "approved", isDemo: true,
    avgRating: 4.5, totalReviews: 16, status: "active",
  },
];

export async function POST() {
  try {
    await dbConnect();

    const existing = await TiffinListing.countDocuments({ isDemo: true });
    if (existing >= 8) {
      return NextResponse.json({ message: "Demo tiffins already seeded", count: existing });
    }

    // Remove old demo tiffins to avoid slug conflicts
    await TiffinListing.deleteMany({ isDemo: true });

    const fakeId = "000000000000000000000001";
    const tiffinsWithProvider = DEMO_TIFFINS.map((t) => ({
      ...t,
      providerId: fakeId,
      providerProfileId: fakeId,
    }));

    const inserted = await TiffinListing.insertMany(tiffinsWithProvider);
    return NextResponse.json({ message: `Seeded ${inserted.length} demo tiffins!`, count: inserted.length });
  } catch (err) {
    console.error("Tiffins seed error:", err);
    return NextResponse.json({ error: "Failed to seed tiffins" }, { status: 500 });
  }
}
