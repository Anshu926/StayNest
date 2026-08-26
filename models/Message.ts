import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderRole: "customer" | "provider";
  senderName: string;
  senderId?: string;
  text: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderRole: { type: String, enum: ["customer", "provider"], required: true },
    senderName: { type: String, required: true },
    senderId: { type: String },
    text: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message =
  models.Message || model<IMessage>("Message", MessageSchema);
