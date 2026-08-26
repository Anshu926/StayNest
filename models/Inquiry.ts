import mongoose, { Schema, Document, model, models } from "mongoose";

export type InquiryStatus = "pending" | "responded" | "resolved" | "closed";

export interface IInquiryMessage {
  _id?: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  senderRole: "customer" | "provider" | "admin";
  senderName: string;
  text: string;
  createdAt: Date;
}

export interface IInquiry extends Document {
  listingId: mongoose.Types.ObjectId;
  listingType: "stay" | "tiffin";
  providerId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: InquiryStatus;
  thread: IInquiryMessage[];
  isReadByProvider: boolean;
  isReadByCustomer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InquiryMessageSchema = new Schema<IInquiryMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    senderRole: { type: String, enum: ["customer", "provider", "admin"], required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const InquirySchema = new Schema<IInquiry>(
  {
    listingId: { type: Schema.Types.ObjectId, required: true },
    listingType: { type: String, enum: ["stay", "tiffin"], required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "responded", "resolved", "closed"],
      default: "pending",
    },
    thread: [InquiryMessageSchema],
    isReadByProvider: { type: Boolean, default: false },
    isReadByCustomer: { type: Boolean, default: true },
  },
  { timestamps: true }
);

InquirySchema.index({ providerId: 1, status: 1, createdAt: -1 });
InquirySchema.index({ customerId: 1, status: 1, createdAt: -1 });
InquirySchema.index({ phone: 1 });
InquirySchema.index({ listingId: 1 });

if (models.Inquiry) {
  delete (models as any).Inquiry;
}

export const Inquiry = models.Inquiry || model<IInquiry>("Inquiry", InquirySchema);
