import mongoose, { Schema, Model } from "mongoose";

export type ProductType = "battery" | "apparel";

export interface IProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  productType: string; // High-level: battery | apparel (synced with category for consistency)
  variant: string; // e.g. "lithium", "t-shirt" - specific variant within product type
  images: string[];
  stock: number;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: { values: ["battery", "apparel"], message: "Category must be battery or apparel" },
      default: "battery",
    },
    productType: {
      type: String,
      required: [true, "Product type is required"],
      trim: true,
      enum: { values: ["battery", "apparel"], message: "Product type must be battery or apparel" },
      default: "battery",
    },
    variant: {
      type: String,
      trim: true,
      default: "lithium",
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: {
        validator: (v: string[]) => v.length >= 1,
        message: "At least one image URL is required",
      },
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });

export const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", ProductSchema);
