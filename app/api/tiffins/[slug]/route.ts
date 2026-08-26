import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { TiffinListing } from "@/models/TiffinListing";
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

    const listing = await TiffinListing.findOne({
      slug,
      status: "active",
    }).lean();
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const providerProfile = await ProviderProfile.findById(
      listing.providerProfileId,
    )
      .select("businessName phone whatsapp isVerified")
      .lean();

    // Fetch reviews (ensure User model is registered for populate)
    void User.modelName; // Force User schema registration
    const reviews = await Review.find({
      listingId: listing._id,
      listingType: "tiffin",
      isApproved: true,
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      listing: { ...listing, provider: providerProfile },
      reviews,
    });
  } catch (error) {
    console.error("GET /api/tiffins/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tiffin" },
      { status: 500 },
    );
  }
}
