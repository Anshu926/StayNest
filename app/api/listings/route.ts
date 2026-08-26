import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { StayListing } from "@/models/StayListing";
import { TiffinListing } from "@/models/TiffinListing";
import { ProviderProfile } from "@/models/ProviderProfile";
import { getUserFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Verify authenticated user
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      type,
      title,
      description,
      price,
      area,
      address,
      images = [],
      // Stay specific fields
      depositAmount = 0,
      roomType = "single",
      genderPreference = "any",
      targetAudience = "any",
      amenities = [],
      rules = [],
      isFoodIncluded = false,
      isAC = false,
      isFurnished = false,
      hasParking = false,
      hasLaundry = false,
      hasAttachedBathroom = false,
      hasWifi = true,
      // Tiffin specific fields
      foodType = "veg",
      mealsPerDay = 2,
      hasBreakfast = false,
      hasLunch = true,
      hasDinner = true,
      dailyPrice = 0,
      hasDelivery = true,
      deliveryCharge = 0,
      deliveryAreas = [],
      menuDescription = "",
    } = body;

    if (!type || !title || !price || !area) {
      return NextResponse.json(
        { message: "Please provide all required fields (type, title, price, area)." },
        { status: 400 }
      );
    }

    // Ensure provider profile exists
    let providerProfile = await ProviderProfile.findOne({ userId: user.userId });
    if (!providerProfile) {
      providerProfile = await ProviderProfile.create({
        userId: user.userId,
        businessName: title,
        phone: user.email,
        isVerified: true,
        verificationStatus: "approved",
        verifiedAt: new Date(),
        totalListings: 0,
      });
    }

    const areaSlug = slugify(area);
    const baseSlug = slugify(title);
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${areaSlug}-${uniqueSuffix}`;

    // Filter valid image URLs (at least 1 image or default fallback)
    const validImages = Array.isArray(images) && images.filter((img: string) => img && typeof img === "string" && img.trim().length > 0).length > 0
      ? images.filter((img: string) => img && typeof img === "string" && img.trim().length > 0)
      : [
          type === "tiffin"
            ? "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80"
            : "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"
        ];

    let createdListing;

    if (type === "tiffin") {
      createdListing = await TiffinListing.create({
        providerId: user.userId,
        providerProfileId: providerProfile._id,
        name: title,
        slug,
        description: description || "Fresh home-cooked food service in Nagpur.",
        area,
        areaSlug,
        address: address || `${area}, Nagpur, Maharashtra`,
        deliveryAreas: deliveryAreas.length > 0 ? deliveryAreas : [area],
        foodType,
        mealsPerDay: Number(mealsPerDay) || 2,
        hasBreakfast: Boolean(hasBreakfast),
        hasLunch: Boolean(hasLunch),
        hasDinner: Boolean(hasDinner),
        monthlyPrice: Number(price),
        dailyPrice: Number(dailyPrice) || Math.round(Number(price) / 25),
        hasDelivery: Boolean(hasDelivery),
        deliveryCharge: Number(deliveryCharge) || 0,
        menuDescription: menuDescription || "Dal, Rice, Sabzi, Rotis, Salad",
        images: validImages,
        isVerified: true,
        verificationStatus: "approved",
        isDemo: false,
        avgRating: 5.0,
        totalReviews: 1,
        status: "active",
      });
    } else {
      // Stay listing (pg, flat, hostel, single-room, shared-room)
      const propertyTypeMap: Record<string, string> = {
        pg: "pg",
        flat: "flat",
        hostel: "hostel",
        room: "single-room",
        "single-room": "single-room",
        "shared-room": "shared-room",
      };

      const finalPropertyType = propertyTypeMap[type] || "pg";

      createdListing = await StayListing.create({
        providerId: user.userId,
        providerProfileId: providerProfile._id,
        name: title,
        slug,
        description: description || "Well-maintained accommodation in Nagpur.",
        propertyType: finalPropertyType,
        area,
        areaSlug,
        address: address || `${area}, Nagpur, Maharashtra`,
        monthlyRent: Number(price),
        depositAmount: Number(depositAmount) || Number(price) * 2,
        roomType: roomType || "single",
        genderPreference: genderPreference || "any",
        targetAudience: targetAudience || "any",
        amenities: amenities.length > 0 ? amenities : ["Wi-Fi", "Electricity", "Water Purifier"],
        rules: rules.length > 0 ? rules : ["Maintain cleanliness", "Respect timings"],
        isFoodIncluded: Boolean(isFoodIncluded),
        isAC: Boolean(isAC),
        isFurnished: Boolean(isFurnished),
        hasParking: Boolean(hasParking),
        hasLaundry: Boolean(hasLaundry),
        hasAttachedBathroom: Boolean(hasAttachedBathroom),
        hasWifi: Boolean(hasWifi),
        images: validImages,
        isAvailable: true,
        isVerified: true,
        verificationStatus: "approved",
        isDemo: false,
        avgRating: 5.0,
        totalReviews: 1,
        totalViews: 1,
        status: "active",
      });
    }

    // Increment provider listings count
    await ProviderProfile.findByIdAndUpdate(providerProfile._id, {
      $inc: { totalListings: 1 },
    });

    return NextResponse.json(
      {
        message: "Listing created successfully!",
        listing: createdListing,
        redirectUrl: type === "tiffin" ? `/tiffins/${slug}` : `/stays/${slug}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/listings error:", error);
    return NextResponse.json(
      { message: "Failed to create listing. Please check input data." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [stays, tiffins] = await Promise.all([
      StayListing.find({ providerId: user.userId }).sort({ createdAt: -1 }).lean(),
      TiffinListing.find({ providerId: user.userId }).sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({
      data: {
        stays,
        tiffins,
        total: stays.length + tiffins.length,
      },
    });
  } catch (error) {
    console.error("GET /api/listings error:", error);
    return NextResponse.json({ message: "Failed to fetch listings" }, { status: 500 });
  }
}
