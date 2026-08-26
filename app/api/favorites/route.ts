import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Favorite } from "@/models/Favorite";
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

    const favs = await Favorite.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();

    const stayIds = favs.filter((f) => f.listingType === "stay").map((f) => f.listingId);
    const tiffinIds = favs.filter((f) => f.listingType === "tiffin").map((f) => f.listingId);

    const [stays, tiffins] = await Promise.all([
      StayListing.find({ _id: { $in: stayIds } }).lean(),
      TiffinListing.find({ _id: { $in: tiffinIds } }).lean(),
    ]);

    // Attach favorite record metadata
    const stayFavorites = stays.map((s) => ({
      ...s,
      isFavorite: true,
      favoriteType: "stay",
    }));

    const tiffinFavorites = tiffins.map((t) => ({
      ...t,
      isFavorite: true,
      favoriteType: "tiffin",
    }));

    return NextResponse.json({
      data: {
        stays: stayFavorites,
        tiffins: tiffinFavorites,
        allIds: favs.map((f) => f.listingId.toString()),
        total: stayFavorites.length + tiffinFavorites.length,
      },
    });
  } catch (error) {
    console.error("GET /api/favorites error:", error);
    return NextResponse.json({ message: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { listingId, listingType = "stay" } = await req.json();
    if (!listingId) {
      return NextResponse.json({ message: "Listing ID is required" }, { status: 400 });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ userId: user.userId, listingId });
    if (existing) {
      return NextResponse.json({ message: "Already in favorites", favorite: existing }, { status: 200 });
    }

    const fav = await Favorite.create({
      userId: user.userId,
      listingId,
      listingType,
    });

    // If stay, increment totalFavorites
    if (listingType === "stay") {
      await StayListing.findByIdAndUpdate(listingId, { $inc: { totalFavorites: 1 } });
    }

    return NextResponse.json({ message: "Added to favorites!", favorite: fav }, { status: 201 });
  } catch (error) {
    console.error("POST /api/favorites error:", error);
    return NextResponse.json({ message: "Failed to add favorite" }, { status: 500 });
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

    const deleted = await Favorite.findOneAndDelete({ userId: user.userId, listingId });

    if (deleted && deleted.listingType === "stay") {
      await StayListing.findByIdAndUpdate(listingId, { $inc: { totalFavorites: -1 } });
    }

    return NextResponse.json({ message: "Removed from favorites", deletedId: listingId }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/favorites error:", error);
    return NextResponse.json({ message: "Failed to remove favorite" }, { status: 500 });
  }
}
