import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IProviderProfile extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  description?: string;
  phone: string;
  whatsapp?: string;
  serviceType?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  verifiedAt?: Date;
  totalListings: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderProfileSchema = new Schema<IProviderProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    phone: { type: String, required: true },
    whatsapp: { type: String, trim: true },
    serviceType: { type: String, default: "pg" },
    address: { type: String, trim: true },
    city: { type: String, default: "Nagpur" },
    state: { type: String, default: "Maharashtra" },
    pincode: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    verifiedAt: { type: Date },
    totalListings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

if (models.ProviderProfile) {
  delete (models as any).ProviderProfile;
}

export const ProviderProfile =
  models.ProviderProfile ||
  model<IProviderProfile>("ProviderProfile", ProviderProfileSchema);
