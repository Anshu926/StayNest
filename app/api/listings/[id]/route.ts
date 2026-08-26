import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { StayListing } from "@/models/StayListing";
import { TiffinListing } from "@/models/TiffinListing";
import { ProviderProfile } from "@/models/ProviderProfile";
import { getUserFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

// GET single listing for editing
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Try finding stay first, then tiffin
    let listing = await StayListing.findById(id).lean();
    let isTiffin = false;

    if (!listing) {
      listing = await TiffinListing.findById(id).lean();
      isTiffin = true;
    }

    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    // Check ownership
    if (
      user.role !== "admin" &&
      listing.providerId.toString() !== user.userId
    ) {
      return NextResponse.json({ message: "Forbidden. You do not own this listing." }, { status: 403 });
    }

    return NextResponse.json({
      data: {
        ...listing,
        listingType: isTiffin ? "tiffin" : (listing as any).propertyType || "pg",
        isTiffin,
      },
    });
  } catch (error) {
    console.error("GET /api/listings/[id] error:", error);
    return NextResponse.json({ message: "Failed to fetch listing" }, { status: 500 });
  }
}

// PUT / Update listing
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Check if it's a stay or tiffin
    let stay = await StayListing.findById(id);
    let tiffin = null;

    if (!stay) {
      tiffin = await TiffinListing.findById(id);
    }

    if (!stay && !tiffin) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    const targetListing = stay || tiffin;

    // Verify ownership
    if (
      user.role !== "admin" &&
      targetListing.providerId.toString() !== user.userId
    ) {
      return NextResponse.json({ message: "Forbidden. You do not own this listing." }, { status: 403 });
    }

    const {
      title,
      description,
      price,
      area,
      address,
      images = [],
      // Stay specific
      propertyType,
      depositAmount,
      roomType,
      genderPreference,
      targetAudience,
      amenities,
      rules,
      isFoodIncluded,
      isAC,
      isFurnished,
      hasParking,
      hasLaundry,
      hasAttachedBathroom,
      hasWifi,
      isAvailable,
      // Tiffin specific
      foodType,
      mealsPerDay,
      hasBreakfast,
      hasLunch,
      hasDinner,
      dailyPrice,
      hasDelivery,
      deliveryCharge,
      deliveryAreas,
      menuDescription,
      status,
    } = body;

    const validImages = Array.isArray(images) && images.filter((img: string) => img && typeof img === "string" && img.trim().length > 0).length > 0
      ? images.filter((img: string) => img && typeof img === "string" && img.trim().length > 0)
      : targetListing.images;

    if (stay) {
      const areaSlug = area ? slugify(area) : stay.areaSlug;
      const updateData: any = {
        name: title || stay.name,
        description: description !== undefined ? description : stay.description,
        monthlyRent: price ? Number(price) : stay.monthlyRent,
        area: area || stay.area,
        areaSlug,
        address: address !== undefined ? address.trim() : stay.address,
        propertyType: propertyType || stay.propertyType,
        depositAmount: depositAmount !== undefined ? Number(depositAmount) : stay.depositAmount,
        roomType: roomType || stay.roomType,
        genderPreference: genderPreference || stay.genderPreference,
        targetAudience: targetAudience || stay.targetAudience,
        amenities: amenities !== undefined ? amenities : stay.amenities,
        rules: rules !== undefined ? rules : stay.rules,
        isFoodIncluded: isFoodIncluded !== undefined ? Boolean(isFoodIncluded) : stay.isFoodIncluded,
        isAC: isAC !== undefined ? Boolean(isAC) : stay.isAC,
        isFurnished: isFurnished !== undefined ? Boolean(isFurnished) : stay.isFurnished,
        hasParking: hasParking !== undefined ? Boolean(hasParking) : stay.hasParking,
        hasLaundry: hasLaundry !== undefined ? Boolean(hasLaundry) : stay.hasLaundry,
        hasAttachedBathroom: hasAttachedBathroom !== undefined ? Boolean(hasAttachedBathroom) : stay.hasAttachedBathroom,
        hasWifi: hasWifi !== undefined ? Boolean(hasWifi) : stay.hasWifi,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : stay.isAvailable,
        status: status || stay.status,
        images: validImages,
      };

      const updatedStay = await StayListing.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      return NextResponse.json({
        message: "Listing updated successfully!",
        listing: updatedStay,
        redirectUrl: `/stays/${stay.slug}`,
      });
    } else if (tiffin) {
      const areaSlug = area ? slugify(area) : tiffin.areaSlug;
      const updateData: any = {
        name: title || tiffin.name,
        description: description !== undefined ? description : tiffin.description,
        monthlyPrice: price ? Number(price) : tiffin.monthlyPrice,
        area: area || tiffin.area,
        areaSlug,
        address: address !== undefined ? address.trim() : tiffin.address,
        foodType: foodType || tiffin.foodType,
        mealsPerDay: mealsPerDay ? Number(mealsPerDay) : tiffin.mealsPerDay,
        hasBreakfast: hasBreakfast !== undefined ? Boolean(hasBreakfast) : tiffin.hasBreakfast,
        hasLunch: hasLunch !== undefined ? Boolean(hasLunch) : tiffin.hasLunch,
        hasDinner: hasDinner !== undefined ? Boolean(hasDinner) : tiffin.hasDinner,
        dailyPrice: dailyPrice !== undefined ? Number(dailyPrice) : tiffin.dailyPrice,
        hasDelivery: hasDelivery !== undefined ? Boolean(hasDelivery) : tiffin.hasDelivery,
        deliveryCharge: deliveryCharge !== undefined ? Number(deliveryCharge) : tiffin.deliveryCharge,
        deliveryAreas: deliveryAreas !== undefined ? deliveryAreas : tiffin.deliveryAreas,
        menuDescription: menuDescription !== undefined ? menuDescription : tiffin.menuDescription,
        status: status || tiffin.status,
        images: validImages,
      };

      const updatedTiffin = await TiffinListing.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      return NextResponse.json({
        message: "Tiffin service updated successfully!",
        listing: updatedTiffin,
        redirectUrl: `/tiffins/${tiffin.slug}`,
      });
    }
  } catch (error) {
    console.error("PUT /api/listings/[id] error:", error);
    return NextResponse.json({ message: "Failed to update listing" }, { status: 500 });
  }
}

// DELETE listing
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let deletedItem = await StayListing.findById(id);
    let isTiffin = false;

    if (!deletedItem) {
      deletedItem = await TiffinListing.findById(id);
      isTiffin = true;
    }

    if (!deletedItem) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    // Verify ownership
    if (
      user.role !== "admin" &&
      deletedItem.providerId.toString() !== user.userId
    ) {
      return NextResponse.json({ message: "Forbidden. You do not own this listing." }, { status: 403 });
    }

    // Delete from DB
    if (isTiffin) {
      await TiffinListing.findByIdAndDelete(id);
    } else {
      await StayListing.findByIdAndDelete(id);
    }

    // Decrement provider listing count
    if (deletedItem.providerProfileId) {
      await ProviderProfile.findByIdAndUpdate(deletedItem.providerProfileId, {
        $inc: { totalListings: -1 },
      });
    }

    return NextResponse.json({
      message: "Listing deleted successfully.",
      deletedId: id,
    });
  } catch (error) {
    console.error("DELETE /api/listings/[id] error:", error);
    return NextResponse.json({ message: "Failed to delete listing" }, { status: 500 });
  }
}
