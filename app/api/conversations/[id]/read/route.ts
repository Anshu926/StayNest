import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = getUserFromRequest(req);

    const conv = await Conversation.findById(id);
    if (!conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (user?.role === "provider") {
      conv.unreadByProvider = 0;
      await Message.updateMany(
        { conversationId: id, senderRole: "customer", isRead: false },
        { $set: { isRead: true } }
      );
    } else {
      conv.unreadByCustomer = 0;
      await Message.updateMany(
        { conversationId: id, senderRole: "provider", isRead: false },
        { $set: { isRead: true } }
      );
    }

    await conv.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/conversations/[id]/read error:", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
