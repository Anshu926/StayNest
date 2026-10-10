import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { StudySpace } from "@/models/StudySpace";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const area = searchParams.get("area") || "";
    const spaceType = searchParams.get("spaceType") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const targetAudience = searchParams.get("targetAudience") || "";
    const noiseLevel = searchParams.get("noiseLevel") || "";
    const hasWifi = searchParams.get("hasWifi") === "true";
    const hasAC = searchParams.get("hasAC") === "true";
    const hasPrinting = searchParams.get("hasPrinting") === "true";
    const hasLocker = searchParams.get("hasLocker") === "true";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { status: "active" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } },
      ];
    }
    if (area) query.areaSlug = area;
    if (spaceType) query.spaceType = spaceType;
    if (targetAudience) query.targetAudience = { $in: [targetAudience, "any"] };
    if (noiseLevel) query.noiseLevel = noiseLevel;
    if (hasWifi) query.hasWifi = true;
    if (hasAC) query.hasAC = true;
    if (hasPrinting) query.hasPrinting = true;
    if (hasLocker) query.hasLocker = true;
    if (maxPrice) {
      query.$or = [
        ...(query.$or || []),
        { hourlyPrice: { $lte: parseInt(maxPrice) } },
        { dailyPrice: { $lte: parseInt(maxPrice) } },
      ];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      "price-asc": { hourlyPrice: 1 },
      "price-desc": { hourlyPrice: -1 },
      rating: { avgRating: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const skip = (page - 1) * limit;
    const [spaces, total] = await Promise.all([
      StudySpace.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
      StudySpace.countDocuments(query),
    ]);

    return NextResponse.json({
      data: JSON.parse(JSON.stringify(spaces)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Study Spaces GET error:", err);
    return NextResponse.json({ error: "Failed to fetch study spaces" }, { status: 500 });
  }
}
