import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Inquiry } from "@/models/Inquiry";
import { Favorite } from "@/models/Favorite";
import { Conversation } from "@/models/Conversation";
import { StayListing } from "@/models/StayListing";
import { TiffinListing } from "@/models/TiffinListing";
import { getUserFromRequest, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const jwtUser = getUserFromRequest(req);
    if (!jwtUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(jwtUser.userId).select("-password").lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get counts & customer's inquiries
    const [favoritesCount, inquiries] = await Promise.all([
      Favorite.countDocuments({ userId: jwtUser.userId }),
      Inquiry.find({
        $or: [
          ...(user.phone ? [{ phone: user.phone }] : []),
          { name: { $regex: new RegExp(`^${user.name}$`, "i") } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Enrich inquiries with listing info & conversationId
    const enrichedInquiries = await Promise.all(
      inquiries.map(async (inq) => {
        let listingInfo: any = null;
        if (inq.listingType === "stay") {
          listingInfo = await StayListing.findById(inq.listingId)
            .select("name images area slug monthlyRent")
            .lean();
        } else {
          listingInfo = await TiffinListing.findById(inq.listingId)
            .select("name images area slug monthlyPrice")
            .lean();
        }

        const conv = await Conversation.findOne({
          listingId: inq.listingId,
          $or: [
            { customerPhone: inq.phone },
            { customerId: user._id },
          ],
        })
          .select("_id lastMessage lastMessageAt")
          .lean();

        return {
          ...inq,
          listing: listingInfo || { name: "Property / Service", area: "Nagpur" },
          conversationId: conv ? conv._id.toString() : null,
        };
      })
    );

    return NextResponse.json({
      data: {
        user,
        stats: {
          favoritesCount,
          inquiriesCount: enrichedInquiries.length,
        },
        recentInquiries: enrichedInquiries,
      },
    });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ message: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const jwtUser = getUserFromRequest(req);
    if (!jwtUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, password } = await req.json();

    const user = await User.findById(jwtUser.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (password && password.trim().length >= 6) {
      user.password = await hashPassword(password.trim());
    }

    await user.save();

    return NextResponse.json({
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
