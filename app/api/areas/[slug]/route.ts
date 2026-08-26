import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Area } from "@/models/Area";
import { StayListing } from "@/models/StayListing";
import { TiffinListing } from "@/models/TiffinListing";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    const area = await Area.findOne({ slug }).lean();
    if (!area) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    const [stays, tiffins] = await Promise.all([
      StayListing.find({ areaSlug: slug, status: "active" }).limit(6).lean(),
      TiffinListing.find({ areaSlug: slug, status: "active" }).limit(4).lean(),
    ]);

    return NextResponse.json({ area, stays, tiffins });
  } catch (error) {
    console.error("GET /api/areas/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch area" }, { status: 500 });
  }
}
