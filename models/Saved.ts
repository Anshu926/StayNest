import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISaved extends Document {
  userId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  listingType: "stay" | "tiffin";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavedSchema = new Schema<ISaved>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: Schema.Types.ObjectId, required: true },
    listingType: { type: String, enum: ["stay", "tiffin"], required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

SavedSchema.index({ userId: 1, listingId: 1 }, { unique: true });

if (models.Saved) {
  delete (models as any).Saved;
}

export const Saved = models.Saved || model<ISaved>("Saved", SavedSchema);
