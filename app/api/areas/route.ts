import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Area } from "@/models/Area";

export async function GET() {
  try {
    await dbConnect();
    const areas = await Area.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({ data: areas });
  } catch (error) {
    console.error("GET /api/areas error:", error);
    return NextResponse.json({ error: "Failed to fetch areas" }, { status: 500 });
  }
}
