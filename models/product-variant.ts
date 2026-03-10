import mongoose, { Schema, Model } from "mongoose";

export interface IProductVariant {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  size: string;
  color: string;
  price: number;
  stock: number;
  sku: string;
  createdAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, trim: true, sparse: true },
  },
  { timestamps: true }
);

ProductVariantSchema.index({ productId: 1 });
ProductVariantSchema.index({ sku: 1 }, { unique: true, sparse: true });

export const ProductVariant: Model<IProductVariant> =
  mongoose.models.ProductVariant ??
  mongoose.model<IProductVariant>("ProductVariant", ProductVariantSchema);
