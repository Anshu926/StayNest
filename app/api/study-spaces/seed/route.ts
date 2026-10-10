import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { StudySpace } from "@/models/StudySpace";

// Seed demo study spaces if none exist
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const existing = await StudySpace.countDocuments({ isDemo: true });
    if (existing > 0) {
      return NextResponse.json({ message: "Demo data already exists", count: existing });
    }

    const demoImages = [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80",
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      "https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80",
    ];

    const demoId = "000000000000000000000001";

    const spaces = await StudySpace.insertMany([
      {
        providerId: demoId,
        name: "Dharampeth Public Library Study Zone",
        slug: "dharampeth-public-library-study-zone",
        description: "A calm and well-maintained study zone inside the Dharampeth Public Library. Best for students who need a quiet environment with access to reference books and study tables.",
        spaceType: "library",
        area: "Dharampeth",
        areaSlug: "dharampeth",
        address: "Dharampeth Public Library, Dharampeth, Nagpur",
        hourlyPrice: 20,
        dailyPrice: 80,
        monthlyPrice: 1200,
        hasWifi: true, hasPrinting: true, hasLocker: true, hasAC: false, hasCafe: false, hasParking: false, hasPowerOutlets: true, hasWhiteboard: false,
        openTime: "08:00", closeTime: "20:00", is24Hours: false,
        totalSeats: 80, targetAudience: "student", noiseLevel: "silent",
        images: [demoImages[0], demoImages[2]], isVerified: true, isDemo: true, avgRating: 4.5, totalReviews: 22, status: "active",
      },
      {
        providerId: demoId,
        name: "StudyHive Coworking — Manish Nagar",
        slug: "studyhive-coworking-manish-nagar",
        description: "A modern coworking space with dedicated student desks, high-speed fibre Wi-Fi, and a chill café corner. Perfect for exam prep, online courses, and group projects.",
        spaceType: "coworking",
        area: "Manish Nagar",
        areaSlug: "manish-nagar",
        address: "Near D-Mart, Manish Nagar, Nagpur",
        hourlyPrice: 50,
        dailyPrice: 200,
        monthlyPrice: 3500,
        hasWifi: true, hasPrinting: true, hasLocker: true, hasAC: true, hasCafe: true, hasParking: true, hasPowerOutlets: true, hasWhiteboard: true,
        openTime: "06:00", closeTime: "23:00", is24Hours: false,
        totalSeats: 40, targetAudience: "any", noiseLevel: "moderate",
        images: [demoImages[1], demoImages[3]], isVerified: true, isDemo: true, avgRating: 4.7, totalReviews: 35, status: "active",
      },
      {
        providerId: demoId,
        name: "FocusDesk — MIHAN Study Room",
        slug: "focusdesk-mihan-study-room",
        description: "Private, bookable study cabins in the MIHAN IT corridor. Silent cubicles with AC, power outlets, and locker facilities. Designed for corporate professionals and working students.",
        spaceType: "private-room",
        area: "MIHAN",
        areaSlug: "mihan",
        address: "IT Zone, SEZ, MIHAN, Nagpur",
        hourlyPrice: 80,
        dailyPrice: 350,
        monthlyPrice: 5500,
        hasWifi: true, hasPrinting: false, hasLocker: true, hasAC: true, hasCafe: false, hasParking: true, hasPowerOutlets: true, hasWhiteboard: false,
        openTime: "00:00", closeTime: "00:00", is24Hours: true,
        totalSeats: 12, targetAudience: "professional", noiseLevel: "silent",
        images: [demoImages[4], demoImages[0]], isVerified: true, isDemo: true, avgRating: 4.8, totalReviews: 18, status: "active",
      },
      {
        providerId: demoId,
        name: "The Study Café — Sadar",
        slug: "the-study-cafe-sadar",
        description: "A cosy café where you can study while sipping your favourite drink. Purchase a beverage and sit for as long as you need. Good for 2–4 hour focused sessions.",
        spaceType: "cafe",
        area: "Sadar",
        areaSlug: "sadar",
        address: "Near Sadar Bus Stand, Sadar, Nagpur",
        hourlyPrice: 0,
        dailyPrice: 0,
        monthlyPrice: 0,
        hasWifi: true, hasPrinting: false, hasLocker: false, hasAC: true, hasCafe: true, hasParking: false, hasPowerOutlets: true, hasWhiteboard: false,
        openTime: "08:00", closeTime: "22:00", is24Hours: false,
        totalSeats: 25, targetAudience: "any", noiseLevel: "moderate",
        images: [demoImages[5], demoImages[3]], isVerified: true, isDemo: true, avgRating: 4.3, totalReviews: 29, status: "active",
      },
      {
        providerId: demoId,
        name: "LaxmiLearn Study Hall — Laxmi Nagar",
        slug: "laxmilearn-study-hall-laxmi-nagar",
        description: "A large student study hall near Laxmi Nagar colleges with 100+ seats, printed notes facility, and separate sections for reading and group discussion.",
        spaceType: "study-hall",
        area: "Laxmi Nagar",
        areaSlug: "laxmi-nagar",
        address: "Opp. VNIT Gate, Laxmi Nagar, Nagpur",
        hourlyPrice: 15,
        dailyPrice: 60,
        monthlyPrice: 900,
        hasWifi: true, hasPrinting: true, hasLocker: false, hasAC: false, hasCafe: false, hasParking: false, hasPowerOutlets: true, hasWhiteboard: true,
        openTime: "05:00", closeTime: "22:00", is24Hours: false,
        totalSeats: 120, targetAudience: "student", noiseLevel: "quiet",
        images: [demoImages[2], demoImages[5]], isVerified: true, isDemo: true, avgRating: 4.2, totalReviews: 41, status: "active",
      },
      {
        providerId: demoId,
        name: "CivilMinds Reading & Study Hub",
        slug: "civilminds-reading-study-hub-civil-lines",
        description: "An upscale, library-style reading and study hub in Civil Lines. Soft ambient lighting, ergonomic chairs, and a curated collection of academic and competitive exam books.",
        spaceType: "library",
        area: "Civil Lines",
        areaSlug: "civil-lines",
        address: "Gandhi Sagar Road, Civil Lines, Nagpur",
        hourlyPrice: 40,
        dailyPrice: 150,
        monthlyPrice: 2500,
        hasWifi: true, hasPrinting: true, hasLocker: true, hasAC: true, hasCafe: true, hasParking: true, hasPowerOutlets: true, hasWhiteboard: false,
        openTime: "07:00", closeTime: "21:00", is24Hours: false,
        totalSeats: 50, targetAudience: "any", noiseLevel: "silent",
        images: [demoImages[1], demoImages[4]], isVerified: true, isDemo: true, avgRating: 4.9, totalReviews: 14, status: "active",
      },
      {
        providerId: demoId,
        name: "WardhaWorks — Flex Study & Work",
        slug: "wardhaworks-flex-study-wardha-road",
        description: "Flexible coworking desks and private cabins on Wardha Road. Ideal for IT professionals working from home and students taking online courses. 24/7 access with key card.",
        spaceType: "coworking",
        area: "Wardha Road",
        areaSlug: "wardha-road",
        address: "Phoenix Palassio Complex, Wardha Road, Nagpur",
        hourlyPrice: 60,
        dailyPrice: 250,
        monthlyPrice: 4200,
        hasWifi: true, hasPrinting: true, hasLocker: true, hasAC: true, hasCafe: true, hasParking: true, hasPowerOutlets: true, hasWhiteboard: true,
        openTime: "00:00", closeTime: "00:00", is24Hours: true,
        totalSeats: 30, targetAudience: "professional", noiseLevel: "quiet",
        images: [demoImages[3], demoImages[0]], isVerified: true, isDemo: true, avgRating: 4.6, totalReviews: 21, status: "active",
      },
      {
        providerId: demoId,
        name: "BajajFocus Study Point",
        slug: "bajajfocus-study-point-bajaj-nagar",
        description: "Budget-friendly study point in Bajaj Nagar. Best for school and college students who need a distraction-free environment near their locality.",
        spaceType: "study-hall",
        area: "Bajaj Nagar",
        areaSlug: "bajaj-nagar",
        address: "Bajaj Nagar Square, Nagpur",
        hourlyPrice: 10,
        dailyPrice: 40,
        monthlyPrice: 700,
        hasWifi: false, hasPrinting: false, hasLocker: false, hasAC: false, hasCafe: false, hasParking: false, hasPowerOutlets: true, hasWhiteboard: false,
        openTime: "06:00", closeTime: "21:00", is24Hours: false,
        totalSeats: 60, targetAudience: "student", noiseLevel: "quiet",
        images: [demoImages[5], demoImages[2]], isVerified: false, isDemo: true, avgRating: 3.9, totalReviews: 9, status: "active",
      },
    ]);

    return NextResponse.json({ message: `Seeded ${spaces.length} demo study spaces.`, count: spaces.length });
  } catch (err) {
    console.error("Study Spaces seed error:", err);
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
