import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { StayListing } from "@/models/StayListing";
import { ProviderProfile } from "@/models/ProviderProfile";
import { Review } from "@/models/Review";
import { User } from "@/models/User";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await dbConnect();
    const { slug } = await params;

    const listing = await StayListing.findOne({
      slug,
      status: "active",
    }).lean();
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Fetch provider info (without sensitive data)
    const providerProfile = await ProviderProfile.findById(
      listing.providerProfileId,
    )
      .select("businessName phone whatsapp isVerified")
      .lean();

    // Fetch reviews (ensure User model is registered for populate)
    void User.modelName; // Force User schema registration
    const reviews = await Review.find({
      listingId: listing._id,
      listingType: "stay",
      isApproved: true,
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Increment view count (fire and forget)
    StayListing.findByIdAndUpdate(listing._id, {
      $inc: { totalViews: 1 },
    }).exec();

    return NextResponse.json({
      listing: { ...listing, provider: providerProfile },
      reviews,
    });
  } catch (error) {
    console.error("GET /api/stays/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 },
    );
  }
}
