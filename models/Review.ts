import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  listingType: "stay" | "tiffin";
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: Schema.Types.ObjectId, required: true },
    listingType: { type: String, enum: ["stay", "tiffin"], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ listingId: 1, listingType: 1 });
ReviewSchema.index({ userId: 1, listingId: 1 }, { unique: true });

export const Review = models.Review || model<IReview>("Review", ReviewSchema);
