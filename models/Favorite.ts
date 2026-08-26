import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  listingType: "stay" | "tiffin";
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: Schema.Types.ObjectId, required: true },
    listingType: { type: String, enum: ["stay", "tiffin"], required: true },
  },
  { timestamps: true }
);

FavoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });

export const Favorite = models.Favorite || model<IFavorite>("Favorite", FavoriteSchema);
