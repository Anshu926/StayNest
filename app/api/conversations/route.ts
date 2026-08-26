import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Conversation } from "@/models/Conversation";
import { StayListing } from "@/models/StayListing";
import { TiffinListing } from "@/models/TiffinListing";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let filter: any = {};
    if (user.role === "provider") {
      filter = { providerId: user.userId };
    } else {
      // For customers, find by their userId OR phone
      filter = {
        $or: [
          { customerId: user.userId },
        ],
      };
    }

    const convs = await Conversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .lean();

    return NextResponse.json({ data: convs, total: convs.length });
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    const body = await req.json();
    const { listingId, listingType, customerName, customerPhone } = body;

    if (!listingId || !listingType) {
      return NextResponse.json({ error: "listingId and listingType are required" }, { status: 400 });
    }

    // Require customer identification
    const cName = (customerName || "").trim();
    const cPhone = (customerPhone || "").trim();

    if (!cName || !cPhone) {
      return NextResponse.json(
        { error: "Customer name and phone are required to start a conversation" },
        { status: 400 }
      );
    }

    // Fetch listing details
    let listing: any = null;
    if (listingType === "stay") {
      listing = await StayListing.findById(listingId).lean();
    } else {
      listing = await TiffinListing.findById(listingId).lean();
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (user && listing.providerId && listing.providerId.toString() === user.userId) {
      return NextResponse.json(
        { error: "You cannot start a customer chat for your own listing." },
        { status: 403 }
      );
    }

    // Find existing conversation for this customer+listing combination
    const matchConditions: any[] = [{ customerPhone: cPhone }];
    if (user?.userId) matchConditions.push({ customerId: user.userId });

    let conv = await Conversation.findOne({
      listingId,
      $or: matchConditions,
    });

    if (!conv) {
      conv = await Conversation.create({
        listingId,
        listingType,
        listingName: listing.name,
        listingImage: listing.images?.[0] || "",
        listingArea: listing.area || "Nagpur",
        listingSlug: listing.slug || "",
        providerId: listing.providerId,
        customerId: user?.userId || undefined,
        customerName: cName,
        customerPhone: cPhone,
        lastMessage: "",
        lastMessageAt: new Date(),
        unreadByProvider: 0,
        unreadByCustomer: 0,
      });
    } else {
      // Update customer name/phone in case it changed
      if (!conv.customerName || conv.customerName === "Customer") {
        conv.customerName = cName;
        conv.customerPhone = cPhone;
        await conv.save();
      }
    }

    return NextResponse.json({ data: conv }, { status: 201 });
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
