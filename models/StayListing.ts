import mongoose, { Schema, Document, model, models } from "mongoose";

export type PropertyType =
  | "pg"
  | "flat"
  | "hostel"
  | "single-room"
  | "shared-room";
export type GenderPreference = "male" | "female" | "any";
export type OccupancyType = "single" | "double" | "triple" | "dormitory";

export interface IStayListing extends Document {
  providerId: mongoose.Types.ObjectId;
  providerProfileId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  propertyType: PropertyType;
  area: string;
  areaSlug: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  monthlyRent: number;
  depositAmount: number;
  roomType: OccupancyType;
  genderPreference: GenderPreference;
  targetAudience: "student" | "professional" | "any";
  amenities: string[];
  rules: string[];
  isFoodIncluded: boolean;
  isAC: boolean;
  isFurnished: boolean;
  hasParking: boolean;
  hasLaundry: boolean;
  hasAttachedBathroom: boolean;
  hasWifi: boolean;
  images: string[];
  isAvailable: boolean;
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  isDemo: boolean;
  avgRating: number;
  totalReviews: number;
  totalViews: number;
  totalFavorites: number;
  status: "active" | "paused" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}

const StayListingSchema = new Schema<IStayListing>(
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
    propertyType: {
      type: String,
      enum: ["pg", "flat", "hostel", "single-room", "shared-room"],
      required: true,
    },
    area: { type: String, required: true },
    areaSlug: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: { lat: { type: Number }, lng: { type: Number } },
    monthlyRent: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    roomType: {
      type: String,
      enum: ["single", "double", "triple", "dormitory"],
      required: true,
    },
    genderPreference: {
      type: String,
      enum: ["male", "female", "any"],
      default: "any",
    },
    targetAudience: {
      type: String,
      enum: ["student", "professional", "any"],
      default: "any",
    },
    amenities: [{ type: String }],
    rules: [{ type: String }],
    isFoodIncluded: { type: Boolean, default: false },
    isAC: { type: Boolean, default: false },
    isFurnished: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    hasLaundry: { type: Boolean, default: false },
    hasAttachedBathroom: { type: Boolean, default: false },
    hasWifi: { type: Boolean, default: true },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isDemo: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalFavorites: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "paused", "deleted"],
      default: "active",
    },
  },
  { timestamps: true },
);

StayListingSchema.index({ areaSlug: 1 });
StayListingSchema.index({ monthlyRent: 1 });
StayListingSchema.index({ propertyType: 1 });
StayListingSchema.index({ status: 1, isAvailable: 1 });

if (models.StayListing) {
  delete (models as any).StayListing;
}

export const StayListing =
  models.StayListing || model<IStayListing>("StayListing", StayListingSchema);
