import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Review } from "@/models/Review";
import { StayListing } from "@/models/StayListing";
import { TiffinListing } from "@/models/TiffinListing";
import { User } from "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

/* ─── Helper: Recalculate and persist avgRating + totalReviews ── */
async function recalcRating(listingId: string, listingType: "stay" | "tiffin") {
  const agg = await Review.aggregate([
    { $match: { listingId: new mongoose.Types.ObjectId(listingId), listingType, isApproved: true } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = agg[0]?.avg ?? 0;
  const count = agg[0]?.count ?? 0;
  const Model = listingType === "stay" ? StayListing : TiffinListing;
  await Model.findByIdAndUpdate(listingId, {
    avgRating: Math.round(avg * 10) / 10, // one decimal
    totalReviews: count,
  });
}

/* ─── GET: Fetch all reviews for a listing ─────────────────────── */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    void User.modelName; // ensure User model registered for populate

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");
    const listingType = searchParams.get("listingType") as "stay" | "tiffin" | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    if (!listingId || !listingType) {
      return NextResponse.json({ error: "listingId and listingType are required" }, { status: 400 });
    }

    const skip = (page - 1) * limit;
    const filter = { listingId: new mongoose.Types.ObjectId(listingId), listingType, isApproved: true };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("userId", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    // Rating breakdown (how many 1-star, 2-star... reviews)
    const breakdown = await Review.aggregate([
      { $match: filter },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);
    const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const b of breakdown) ratingMap[b._id] = b.count;

    return NextResponse.json({ reviews, total, page, ratingBreakdown: ratingMap });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

/* ─── POST: Submit a new review ────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "You must be logged in to leave a review" }, { status: 401 });
    }

    const body = await req.json();
    const { listingId, listingType, rating, comment } = body;

    if (!listingId || !listingType) {
      return NextResponse.json({ error: "listingId and listingType are required" }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
    }
    if (comment.trim().length > 1000) {
      return NextResponse.json({ error: "Review must be under 1000 characters" }, { status: 400 });
    }

    // Check listing exists
    const Model = listingType === "stay" ? StayListing : TiffinListing;
    const listing = await Model.findById(listingId).lean();
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Prevent provider from reviewing their own listing
    if (listing.providerId.toString() === user.userId) {
      return NextResponse.json({ error: "You cannot review your own listing" }, { status: 403 });
    }

    // Check for duplicate (unique index: userId + listingId)
    const existing = await Review.findOne({
      userId: new mongoose.Types.ObjectId(user.userId),
      listingId: new mongoose.Types.ObjectId(listingId),
    });
    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this listing", existingId: existing._id }, { status: 409 });
    }

    const review = await Review.create({
      userId: new mongoose.Types.ObjectId(user.userId),
      listingId: new mongoose.Types.ObjectId(listingId),
      listingType,
      rating: Number(rating),
      comment: comment.trim(),
      isApproved: true,
    });

    // Recalculate listing's avgRating + totalReviews
    await recalcRating(listingId, listingType);

    // Populate user name for the response
    const populated = await Review.findById(review._id).populate("userId", "name avatar").lean();

    return NextResponse.json({ review: populated, success: true }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "You have already reviewed this listing" }, { status: 409 });
    }
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
