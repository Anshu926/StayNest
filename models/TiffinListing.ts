import mongoose, { Schema, Document, model, models } from "mongoose";

export type FoodType = "veg" | "non-veg" | "jain" | "veg-nonveg";

export interface ITiffinListing extends Document {
  providerId: mongoose.Types.ObjectId;
  providerProfileId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  area: string;
  areaSlug: string;
  address?: string;
  deliveryAreas: string[];
  foodType: FoodType;
  mealsPerDay: number;
  hasBreakfast: boolean;
  hasLunch: boolean;
  hasDinner: boolean;
  monthlyPrice: number;
  dailyPrice?: number;
  hasDelivery: boolean;
  deliveryCharge?: number;
  menuDescription?: string;
  images: string[];
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  isDemo: boolean;
  avgRating: number;
  totalReviews: number;
  status: "active" | "paused" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}

const TiffinListingSchema = new Schema<ITiffinListing>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerProfileId: {
      type: Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    area: { type: String, required: true },
    areaSlug: { type: String, required: true },
    address: { type: String, trim: true },
    deliveryAreas: [{ type: String }],
    foodType: {
      type: String,
      enum: ["veg", "non-veg", "jain", "veg-nonveg"],
      required: true,
    },
    mealsPerDay: { type: Number, default: 2 },
    hasBreakfast: { type: Boolean, default: false },
    hasLunch: { type: Boolean, default: true },
    hasDinner: { type: Boolean, default: true },
    monthlyPrice: { type: Number, required: true },
    dailyPrice: { type: Number },
    hasDelivery: { type: Boolean, default: true },
    deliveryCharge: { type: Number, default: 0 },
    menuDescription: { type: String },
    images: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isDemo: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "paused", "deleted"],
      default: "active",
    },
  },
  { timestamps: true },
);

TiffinListingSchema.index({ areaSlug: 1 });
TiffinListingSchema.index({ monthlyPrice: 1 });
TiffinListingSchema.index({ foodType: 1 });

if (models.TiffinListing) {
  delete (models as any).TiffinListing;
}

export const TiffinListing =
  models.TiffinListing ||
  model<ITiffinListing>("TiffinListing", TiffinListingSchema);
