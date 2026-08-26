import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "customer" | "provider" | "admin";
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
    },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1 });

export const User = models.User || model<IUser>("User", UserSchema);
