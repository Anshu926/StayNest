import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { TiffinListing } from "@/models/TiffinListing";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { status: "active" };

    const area = searchParams.get("area");
    if (area) filter.areaSlug = area;

    const foodType = searchParams.get("foodType");
    if (foodType) filter.foodType = foodType;

    const hasDelivery = searchParams.get("hasDelivery");
    if (hasDelivery === "true") filter.hasDelivery = true;

    const mealsPerDay = searchParams.get("mealsPerDay");
    if (mealsPerDay) filter.mealsPerDay = parseInt(mealsPerDay);

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      filter.monthlyPrice = {};
      if (minPrice)
        (filter.monthlyPrice as Record<string, number>).$gte =
          parseInt(minPrice);
      if (maxPrice)
        (filter.monthlyPrice as Record<string, number>).$lte =
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

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    const sortParam = searchParams.get("sort");
    if (sortParam === "price-asc") sort = { monthlyPrice: 1 };
    else if (sortParam === "price-desc") sort = { monthlyPrice: -1 };
    else if (sortParam === "rating") sort = { avgRating: -1 };

    const [data, total] = await Promise.all([
      TiffinListing.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      TiffinListing.countDocuments(filter),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + data.length < total,
    });
  } catch (error) {
    console.error("GET /api/tiffins error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tiffins" },
      { status: 500 },
    );
  }
}
