import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Saved } from "@/models/Saved";
import { StayListing } from "@/models/StayListing";
import { TiffinListing } from "@/models/TiffinListing";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const savedRecords = await Saved.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();

    const stayIds = savedRecords.filter((s) => s.listingType === "stay").map((s) => s.listingId);
    const tiffinIds = savedRecords.filter((s) => s.listingType === "tiffin").map((s) => s.listingId);

    const [stays, tiffins] = await Promise.all([
      StayListing.find({ _id: { $in: stayIds } }).lean(),
      TiffinListing.find({ _id: { $in: tiffinIds } }).lean(),
    ]);

    const staySaved = stays.map((s) => ({
      ...s,
      isSaved: true,
      savedType: "stay",
    }));

    const tiffinSaved = tiffins.map((t) => ({
      ...t,
      isSaved: true,
      savedType: "tiffin",
    }));

    return NextResponse.json({
      data: {
        stays: staySaved,
        tiffins: tiffinSaved,
        allIds: savedRecords.map((s) => s.listingId.toString()),
        total: staySaved.length + tiffinSaved.length,
      },
    });
  } catch (error) {
    console.error("GET /api/saved error:", error);
    return NextResponse.json({ message: "Failed to fetch saved listings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { listingId, listingType = "stay", notes } = await req.json();
    if (!listingId) {
      return NextResponse.json({ message: "Listing ID is required" }, { status: 400 });
    }

    const existing = await Saved.findOne({ userId: user.userId, listingId });
    if (existing) {
      return NextResponse.json({ message: "Already in saved collection", saved: existing }, { status: 200 });
    }

    const saved = await Saved.create({
      userId: user.userId,
      listingId,
      listingType,
      notes: notes ? notes.trim() : undefined,
    });

    return NextResponse.json({ message: "Added to saved collection!", saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/saved error:", error);
    return NextResponse.json({ message: "Failed to save listing" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");

    if (!listingId) {
      return NextResponse.json({ message: "Listing ID is required" }, { status: 400 });
    }

    await Saved.findOneAndDelete({ userId: user.userId, listingId });

    return NextResponse.json({ message: "Removed from saved collection", deletedId: listingId }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/saved error:", error);
    return NextResponse.json({ message: "Failed to remove saved listing" }, { status: 500 });
  }
}
