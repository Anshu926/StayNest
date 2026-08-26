import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { StayListing } from "@/models/StayListing";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, any> = { status: "active", isAvailable: true };

    const area = searchParams.get("area");
    if (area) filter.areaSlug = area;

    const propertyType = searchParams.get("propertyType");
    if (propertyType) filter.propertyType = propertyType;

    const targetAudience = searchParams.get("targetAudience");
    if (targetAudience && targetAudience !== "any")
      filter.targetAudience = { $in: [targetAudience, "any"] };

    const genderPreference = searchParams.get("genderPreference");
    if (genderPreference && genderPreference !== "any")
      filter.genderPreference = { $in: [genderPreference, "any"] };

    const isFurnished = searchParams.get("isFurnished");
    if (isFurnished === "true") filter.isFurnished = true;

    const isAC = searchParams.get("isAC");
    if (isAC === "true") filter.isAC = true;

    const isFoodIncluded = searchParams.get("isFoodIncluded");
    if (isFoodIncluded === "true") filter.isFoodIncluded = true;

    const hasWifi = searchParams.get("hasWifi");
    if (hasWifi === "true") filter.hasWifi = true;

    const hasParking = searchParams.get("hasParking");
    if (hasParking === "true") filter.hasParking = true;

    const hasLaundry = searchParams.get("hasLaundry");
    if (hasLaundry === "true") filter.hasLaundry = true;

    const hasAttachedBathroom = searchParams.get("hasAttachedBathroom");
    if (hasAttachedBathroom === "true") filter.hasAttachedBathroom = true;

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      filter.monthlyRent = {};
      if (minPrice)
        (filter.monthlyRent as Record<string, number>).$gte =
          parseInt(minPrice);
      if (maxPrice)
        (filter.monthlyRent as Record<string, number>).$lte =
          parseInt(maxPrice);
    }

    const search = searchParams.get("search");
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sort
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    const sortParam = searchParams.get("sort");
    if (sortParam === "price-asc") sort = { monthlyRent: 1 };
    else if (sortParam === "price-desc") sort = { monthlyRent: -1 };
    else if (sortParam === "rating") sort = { avgRating: -1 };
    else if (sortParam === "newest") sort = { createdAt: -1 };

    const [data, total] = await Promise.all([
      StayListing.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      StayListing.countDocuments(filter),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + data.length < total,
    });
  } catch (error) {
    console.error("GET /api/stays error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stays" },
      { status: 500 },
    );
  }
}
