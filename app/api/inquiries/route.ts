import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Inquiry } from "@/models/Inquiry";
import { StayListing } from "@/models/StayListing";
import { TiffinListing } from "@/models/TiffinListing";
import { User } from "@/models/User";
import { ProviderProfile } from "@/models/ProviderProfile";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");
    const listingIdParam = searchParams.get("listingId");
    const sortParam = searchParams.get("sort") || "newest";
    const roleParam = searchParams.get("role");

    // Determine query context
    const isProviderView = roleParam === "provider" || (user.role === "provider" && roleParam !== "customer");
    const userObjId = new mongoose.Types.ObjectId(user.userId);

    let query: any = {};

    if (isProviderView) {
      query.providerId = userObjId;
    } else {
      // Customer view: query by customerId OR by user email/phone
      const userDoc = await User.findById(userObjId).lean();
      const orConditions: any[] = [{ customerId: userObjId }];
      if (userDoc?.phone) orConditions.push({ phone: userDoc.phone });
      if (userDoc?.email) orConditions.push({ email: userDoc.email });
      query.$or = orConditions;
    }

    // Status filter
    if (statusParam && statusParam !== "all") {
      query.status = statusParam;
    }

    // Listing filter
    if (listingIdParam && listingIdParam !== "all") {
      query.listingId = new mongoose.Types.ObjectId(listingIdParam);
    }

    // Sorting
    const sortOrder: any = sortParam === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const rawInquiries = await Inquiry.find(query).sort(sortOrder).lean();

    // Enrich with listing details, provider profile, customer details
    const enriched = await Promise.all(
      rawInquiries.map(async (inq: any) => {
        let listingInfo: any = null;
        if (inq.listingType === "stay") {
          listingInfo = await StayListing.findById(inq.listingId)
            .select("name images area slug monthlyRent depositAmount propertyType address")
            .lean();
        } else {
          listingInfo = await TiffinListing.findById(inq.listingId)
            .select("name images area slug monthlyPrice dailyPrice foodType address")
            .lean();
        }

        // Provider info
        const providerUser = await User.findById(inq.providerId).select("name email phone").lean();
        const providerProfile = await ProviderProfile.findOne({ userId: inq.providerId })
          .select("businessName phone whatsapp address")
          .lean();

        // Ensure thread has initial message if empty
        const thread = inq.thread && inq.thread.length > 0
          ? inq.thread
          : [
              {
                _id: inq._id,
                senderRole: "customer",
                senderName: inq.name,
                text: inq.message,
                createdAt: inq.createdAt,
              },
            ];

        // Linked conversation ID if exists
        const conv = await Conversation.findOne({
          listingId: inq.listingId,
          customerPhone: inq.phone,
        }).select("_id").lean();

        return {
          ...inq,
          thread,
          listing: listingInfo || {
            name: "Listing Details",
            images: [],
            area: "Nagpur",
            slug: "",
          },
          provider: {
            name: providerUser?.name || "Provider",
            email: providerUser?.email || "",
            phone: providerProfile?.phone || providerUser?.phone || inq.phone,
            whatsapp: providerProfile?.whatsapp || providerProfile?.phone || providerUser?.phone || "",
            businessName: providerProfile?.businessName || providerUser?.name || "Provider",
          },
          conversationId: conv ? conv._id.toString() : null,
        };
      })
    );

    // If search filter is active
    let filtered = enriched;
    if (searchParam && searchParam.trim()) {
      const q = searchParam.trim().toLowerCase();
      filtered = enriched.filter((i) => {
        const listingName = i.listing?.name?.toLowerCase() || "";
        const customerName = i.name?.toLowerCase() || "";
        const customerPhone = i.phone || "";
        const providerName = i.provider?.name?.toLowerCase() || "";
        const providerBusiness = i.provider?.businessName?.toLowerCase() || "";
        const messageText = i.message?.toLowerCase() || "";
        return (
          listingName.includes(q) ||
          customerName.includes(q) ||
          customerPhone.includes(q) ||
          providerName.includes(q) ||
          providerBusiness.includes(q) ||
          messageText.includes(q)
        );
      });
    }

    // Stats calculations
    const stats = {
      total: enriched.length,
      pending: enriched.filter((i) => i.status === "pending").length,
      responded: enriched.filter((i) => i.status === "responded").length,
      resolved: enriched.filter((i) => i.status === "resolved").length,
      closed: enriched.filter((i) => i.status === "closed").length,
      unread: isProviderView
        ? enriched.filter((i) => !i.isReadByProvider).length
        : enriched.filter((i) => !i.isReadByCustomer).length,
    };

    return NextResponse.json({
      success: true,
      data: filtered,
      stats,
      total: filtered.length,
    });
  } catch (error) {
    console.error("GET /api/inquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { listingId, listingType, name, phone, email, message } = body;

    if (!listingId || !listingType || !name || !phone || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid 10-digit Indian phone number" }, { status: 400 });
    }

    let listing: any = null;
    if (listingType === "stay") {
      listing = await StayListing.findById(listingId).select("name images area slug providerId").lean();
    } else {
      listing = await TiffinListing.findById(listingId).select("name images area slug providerId").lean();
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const user = getUserFromRequest(req);
    if (user && listing.providerId && listing.providerId.toString() === user.userId) {
      return NextResponse.json(
        { error: "You cannot send inquiries for your own listing." },
        { status: 403 }
      );
    }

    const trimmedName = name.trim().slice(0, 100);
    const trimmedPhone = phone.trim();
    const trimmedEmail = email ? email.trim().toLowerCase() : (user?.email || undefined);
    const trimmedMessage = message.trim().slice(0, 1000);

    const initialThreadMsg = {
      senderId: user?.userId ? new mongoose.Types.ObjectId(user.userId) : undefined,
      senderRole: "customer",
      senderName: trimmedName,
      text: trimmedMessage,
      createdAt: new Date(),
    };

    // Create Inquiry Record
    const inquiry = await Inquiry.create({
      listingId,
      listingType,
      providerId: listing.providerId,
      customerId: user?.userId ? new mongoose.Types.ObjectId(user.userId) : undefined,
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      message: trimmedMessage,
      status: "pending",
      thread: [initialThreadMsg],
      isReadByProvider: false,
      isReadByCustomer: true,
    });

    // Create or sync with Conversation thread
    let conv = await Conversation.findOne({
      listingId,
      customerPhone: trimmedPhone,
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
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        lastMessage: trimmedMessage,
        lastMessageAt: new Date(),
        unreadByProvider: 1,
        unreadByCustomer: 0,
      });
    } else {
      conv.lastMessage = trimmedMessage;
      conv.lastMessageAt = new Date();
      conv.unreadByProvider += 1;
      await conv.save();
    }

    // Also create first message in thread
    await Message.create({
      conversationId: conv._id,
      senderRole: "customer",
      senderName: trimmedName,
      senderId: user?.userId || undefined,
      text: trimmedMessage,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry submitted successfully!",
        inquiryId: inquiry._id,
        conversationId: conv._id.toString(),
        listingName: listing.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/inquiries error:", error);
    return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
  }
}
