import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Review } from "@/models/Review";
import { getUserFromRequest } from "@/lib/auth";

/* ─── DELETE: Remove own review ────────────────────────────────── */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Only the author or admin can delete
    if (review.userId.toString() !== user.userId && user.role !== "admin") {
      return NextResponse.json({ error: "You can only delete your own review" }, { status: 403 });
    }

    const { listingId, listingType } = review;
    await review.deleteOne();

    // Recalculate listing avgRating + totalReviews
    const { StayListing } = await import("@/models/StayListing");
    const { TiffinListing } = await import("@/models/TiffinListing");

    const agg = await Review.aggregate([
      { $match: { listingId: new mongoose.Types.ObjectId(listingId.toString()), listingType, isApproved: true } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const avg = agg[0]?.avg ?? 0;
    const count = agg[0]?.count ?? 0;
    const Model = listingType === "stay" ? StayListing : TiffinListing;
    await Model.findByIdAndUpdate(listingId, {
      avgRating: Math.round(avg * 10) / 10,
      totalReviews: count,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/reviews/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
