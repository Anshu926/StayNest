import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Inquiry } from "@/models/Inquiry";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id } = await params;
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    if (inquiry.status === "closed") {
      return NextResponse.json({ error: "This enquiry conversation is closed." }, { status: 400 });
    }

    const isProvider = inquiry.providerId.toString() === user.userId;
    const isCustomer = inquiry.customerId?.toString() === user.userId || inquiry.email === user.email || user.role === "customer";
    const isAdmin = user.role === "admin";

    if (!isProvider && !isCustomer && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You cannot reply to this enquiry" }, { status: 403 });
    }

    const senderRole = isProvider ? "provider" : "customer";
    const senderName = user.role === "provider" ? "Provider" : inquiry.name || "Customer";

    const newMsg = {
      senderId: new mongoose.Types.ObjectId(user.userId),
      senderRole,
      senderName,
      text: text.trim(),
      createdAt: new Date(),
    };

    inquiry.thread.push(newMsg as any);

    // If provider replies and current status was pending, update to responded
    if (isProvider) {
      if (inquiry.status === "pending") {
        inquiry.status = "responded";
      }
      inquiry.isReadByProvider = true;
      inquiry.isReadByCustomer = false;
    } else {
      inquiry.isReadByCustomer = true;
      inquiry.isReadByProvider = false;
    }

    await inquiry.save();

    // Sync with Conversation thread if available
    try {
      const conv = await Conversation.findOne({
        listingId: inquiry.listingId,
        customerPhone: inquiry.phone,
      });

      if (conv) {
        conv.lastMessage = text.trim();
        conv.lastMessageAt = new Date();
        if (isProvider) {
          conv.unreadByCustomer += 1;
        } else {
          conv.unreadByProvider += 1;
        }
        await conv.save();

        await Message.create({
          conversationId: conv._id,
          senderRole,
          senderName,
          senderId: user.userId,
          text: text.trim(),
        });
      }
    } catch (syncErr) {
      console.warn("Conversation sync non-blocking error:", syncErr);
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully!",
      data: inquiry,
    });
  } catch (error) {
    console.error("POST /api/inquiries/[id]/reply error:", error);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
