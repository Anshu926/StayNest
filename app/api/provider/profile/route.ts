import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { ProviderProfile } from "@/models/ProviderProfile";
import { getUserFromRequest, comparePassword, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const jwtUser = getUserFromRequest(req);
    if (!jwtUser) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const user = await User.findById(jwtUser.userId).select("-password").lean();
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    let profile = await ProviderProfile.findOne({ userId: jwtUser.userId }).lean();

    // Auto-create default provider profile if not yet created
    if (!profile) {
      const newProfile = await ProviderProfile.create({
        userId: user._id,
        businessName: user.name || "My Business",
        phone: user.phone || "",
        whatsapp: user.phone || "",
        isVerified: true,
        verificationStatus: "approved",
        verifiedAt: new Date(),
        totalListings: 0,
        city: "Nagpur",
        state: "Maharashtra",
      });
      profile = newProfile.toObject();
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role,
        },
        profile,
      },
    });
  } catch (error) {
    console.error("GET /api/provider/profile error:", error);
    return NextResponse.json({ message: "Failed to load provider profile." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const jwtUser = getUserFromRequest(req);
    if (!jwtUser) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      whatsapp,
      businessName,
      businessType,
      serviceType,
      address,
      city = "Nagpur",
      state = "Maharashtra",
      pincode,
      description,
      currentPassword,
      newPassword,
    } = body;

    // 1. Update User Record
    const user = await User.findById(jwtUser.userId).select("+password");
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (phone && phone.trim()) {
      user.phone = phone.trim();
    }

    // Optional password change
    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { message: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          { message: "Please provide your current password to set a new password." },
          { status: 400 }
        );
      }

      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Current password does not match." },
          { status: 400 }
        );
      }

      user.password = await hashPassword(newPassword.trim());
    }

    await user.save();

    // 2. Update ProviderProfile Record
    const profileUpdate: any = {
      businessName: (businessName && businessName.trim()) || user.name,
      phone: (phone && phone.trim()) || user.phone || "",
      whatsapp: (whatsapp && whatsapp.trim()) || phone || "",
      serviceType: serviceType || businessType || "pg",
      address: address ? address.trim() : "",
      city: city ? city.trim() : "Nagpur",
      state: state ? state.trim() : "Maharashtra",
      pincode: pincode ? pincode.trim() : "",
      description: description ? description.trim() : "",
    };

    const updatedProfile = await ProviderProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: profileUpdate },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Provider settings updated successfully!",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role,
        },
        profile: updatedProfile,
      },
    });
  } catch (error) {
    console.error("PUT /api/provider/profile error:", error);
    return NextResponse.json(
      { message: "Failed to update provider settings." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
