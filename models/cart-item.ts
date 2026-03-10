import mongoose, { Schema, Model } from "mongoose";

export interface ICartItem {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId | null;
  quantity: number;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
      index: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      default: null,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
  },
  { timestamps: true }
);

CartItemSchema.index({ userId: 1, productId: 1, variantId: 1 }, { unique: true });

export const CartItem: Model<ICartItem> =
  mongoose.models.CartItem ??
  mongoose.model<ICartItem>("CartItem", CartItemSchema);
