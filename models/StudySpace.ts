import mongoose, { Schema, Document, model, models } from "mongoose";

export type SpaceType =
  | "library"
  | "cafe"
  | "coworking"
  | "private-room"
  | "study-hall"
  | "coaching-centre";

export interface IStudySpace extends Document {
  providerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  spaceType: SpaceType;
  area: string;
  areaSlug: string;
  address: string;
  // Pricing
  hourlyPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
  // Amenities
  hasWifi: boolean;
  hasPrinting: boolean;
  hasLocker: boolean;
  hasAC: boolean;
  hasCafe: boolean;
  hasParking: boolean;
  hasPowerOutlets: boolean;
  hasWhiteboard: boolean;
  // Operational
  openTime: string;        // e.g. "06:00"
  closeTime: string;       // e.g. "22:00"
  is24Hours: boolean;
  totalSeats: number;
  targetAudience: "student" | "professional" | "any";
  noiseLevel: "silent" | "quiet" | "moderate";
  images: string[];
  // Meta
  isVerified: boolean;
  isDemo: boolean;
  avgRating: number;
  totalReviews: number;
  status: "active" | "paused" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}

const StudySpaceSchema = new Schema<IStudySpace>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    spaceType: {
      type: String,
      enum: ["library", "cafe", "coworking", "private-room", "study-hall", "coaching-centre"],
      required: true,
    },
    area: { type: String, required: true },
    areaSlug: { type: String, required: true },
    address: { type: String, required: true },
    hourlyPrice: { type: Number },
    dailyPrice: { type: Number },
    monthlyPrice: { type: Number },
    hasWifi: { type: Boolean, default: true },
    hasPrinting: { type: Boolean, default: false },
    hasLocker: { type: Boolean, default: false },
    hasAC: { type: Boolean, default: false },
    hasCafe: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    hasPowerOutlets: { type: Boolean, default: true },
    hasWhiteboard: { type: Boolean, default: false },
    openTime: { type: String, default: "06:00" },
    closeTime: { type: String, default: "22:00" },
    is24Hours: { type: Boolean, default: false },
    totalSeats: { type: Number, default: 10 },
    targetAudience: { type: String, enum: ["student", "professional", "any"], default: "any" },
    noiseLevel: { type: String, enum: ["silent", "quiet", "moderate"], default: "quiet" },
    images: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "paused", "deleted"], default: "active" },
  },
  { timestamps: true }
);

StudySpaceSchema.index({ areaSlug: 1 });
StudySpaceSchema.index({ spaceType: 1 });
StudySpaceSchema.index({ slug: 1 });
StudySpaceSchema.index({ status: 1 });

export const StudySpace = models.StudySpace || model<IStudySpace>("StudySpace", StudySpaceSchema);
