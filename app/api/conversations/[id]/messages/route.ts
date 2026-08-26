import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const conv = await Conversation.findById(id).lean();
    if (!conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      conversation: conv,
      messages,
      total: messages.length,
    });
  } catch (error) {
    console.error("GET /api/conversations/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { text, senderRole: bodySenderRole, senderName: bodySenderName } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const conv = await Conversation.findById(id);
    if (!conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Determine sender role:
    // If the request carries a valid JWT, use the JWT role (trusted).
    // If no JWT (unauthenticated customer), accept senderRole from body — but only "customer".
    const jwtUser = getUserFromRequest(req);

    let role: "customer" | "provider";
    let name: string;

    if (jwtUser) {
      // JWT is present – use the verified role
      role = jwtUser.role === "provider" ? "provider" : "customer";
      name = bodySenderName?.trim() || jwtUser.email?.split("@")[0] || (role === "provider" ? "Provider" : "Customer");
    } else {
      // No JWT – always treat as customer (security: never allow provider impersonation without JWT)
      role = "customer";
      name = bodySenderName?.trim() || conv.customerName || "Customer";
    }

    const message = await Message.create({
      conversationId: conv._id,
      senderRole: role,
      senderName: name,
      senderId: jwtUser?.userId || undefined,
      text: text.trim(),
    });

    // Update conversation metadata
    conv.lastMessage = text.trim();
    conv.lastMessageAt = new Date();
    if (role === "provider") {
      conv.unreadByCustomer += 1;
    } else {
      conv.unreadByProvider += 1;
    }
    await conv.save();

    return NextResponse.json({ message, success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/conversations/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
