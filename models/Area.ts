import { Schema, Document, model, models } from "mongoose";

export interface IArea extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  popularFor: string[];
  zones: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AreaSchema = new Schema<IArea>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    image: { type: String },
    popularFor: [{ type: String }],
    zones: [{ type: String }],
  },
  { timestamps: true },
);

export const Area = models.Area || model<IArea>("Area", AreaSchema);
