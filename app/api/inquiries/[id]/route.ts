import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Inquiry } from "@/models/Inquiry";
import { StayListing } from "@/models/StayListing";
import { TiffinListing } from "@/models/TiffinListing";
import { User } from "@/models/User";
import { ProviderProfile } from "@/models/ProviderProfile";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Enquiry ID" }, { status: 400 });
    }

    const inquiry = await Inquiry.findById(id).lean();
    if (!inquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Permission check
    const isProvider = inquiry.providerId.toString() === user.userId;
    const isCustomer = inquiry.customerId?.toString() === user.userId || inquiry.email === user.email;
    const isAdmin = user.role === "admin";

    if (!isProvider && !isCustomer && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You cannot access this enquiry" }, { status: 403 });
    }

    // Mark as read
    if (isProvider && !inquiry.isReadByProvider) {
      await Inquiry.findByIdAndUpdate(id, { isReadByProvider: true });
    }
    if (isCustomer && !inquiry.isReadByCustomer) {
      await Inquiry.findByIdAndUpdate(id, { isReadByCustomer: true });
    }

    // Enrich
    let listingInfo: any = null;
    if (inquiry.listingType === "stay") {
      listingInfo = await StayListing.findById(inquiry.listingId).lean();
    } else {
      listingInfo = await TiffinListing.findById(inquiry.listingId).lean();
    }

    const providerUser = await User.findById(inquiry.providerId).select("name email phone").lean();
    const providerProfile = await ProviderProfile.findOne({ userId: inquiry.providerId }).lean();

    return NextResponse.json({
      success: true,
      data: {
        ...inquiry,
        listing: listingInfo,
        provider: {
          name: providerUser?.name || "Provider",
          email: providerUser?.email || "",
          phone: providerProfile?.phone || providerUser?.phone || inquiry.phone,
          whatsapp: providerProfile?.whatsapp || providerProfile?.phone || providerUser?.phone || "",
          businessName: providerProfile?.businessName || providerUser?.name || "Provider",
        },
      },
    });
  } catch (error) {
    console.error("GET /api/inquiries/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch enquiry" }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["pending", "responded", "resolved", "closed"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Permission check
    const isProvider = inquiry.providerId.toString() === user.userId;
    const isCustomer = inquiry.customerId?.toString() === user.userId || inquiry.email === user.email;
    const isAdmin = user.role === "admin";

    if (!isProvider && !isCustomer && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You cannot modify this enquiry" }, { status: 403 });
    }

    inquiry.status = status;
    if (isProvider) {
      inquiry.isReadByProvider = true;
    } else {
      inquiry.isReadByCustomer = true;
    }

    await inquiry.save();

    return NextResponse.json({
      success: true,
      message: `Enquiry status updated to ${status}!`,
      data: inquiry,
    });
  } catch (error) {
    console.error("PATCH /api/inquiries/[id] error:", error);
    return NextResponse.json({ error: "Failed to update enquiry status" }, { status: 500 });
  }
}

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
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    const isProvider = inquiry.providerId.toString() === user.userId;
    const isCustomer = inquiry.customerId?.toString() === user.userId || inquiry.email === user.email;
    const isAdmin = user.role === "admin";

    if (!isProvider && !isCustomer && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You cannot delete this enquiry" }, { status: 403 });
    }

    await Inquiry.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Enquiry removed successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/inquiries/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete enquiry" }, { status: 500 });
  }
}
