import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IConversation extends Document {
  listingId: mongoose.Types.ObjectId;
  listingType: "stay" | "tiffin";
  listingName: string;
  listingImage?: string;
  listingArea?: string;
  listingSlug?: string;
  providerId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadByProvider: number;
  unreadByCustomer: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    listingId: { type: Schema.Types.ObjectId, required: true },
    listingType: { type: String, enum: ["stay", "tiffin"], required: true },
    listingName: { type: String, required: true },
    listingImage: { type: String },
    listingArea: { type: String },
    listingSlug: { type: String },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    unreadByProvider: { type: Number, default: 0 },
    unreadByCustomer: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ConversationSchema.index({ providerId: 1, lastMessageAt: -1 });
ConversationSchema.index({ customerPhone: 1 });
ConversationSchema.index({ customerId: 1 });
ConversationSchema.index({ listingId: 1, customerPhone: 1 });

export const Conversation =
  models.Conversation || model<IConversation>("Conversation", ConversationSchema);
