import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IReport extends Document {
  reportedBy?: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  listingType: "stay" | "tiffin";
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: "User" },
    listingId: { type: Schema.Types.ObjectId, required: true },
    listingType: { type: String, enum: ["stay", "tiffin"], required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
  },
  { timestamps: true }
);

export const Report = models.Report || model<IReport>("Report", ReportSchema);
