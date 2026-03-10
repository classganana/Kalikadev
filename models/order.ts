import mongoose, { Schema, Model } from "mongoose";
import {
  ORDER_STATUS,
  DELIVERY_PARTNER,
  type OrderStatus,
  type DeliveryPartner,
} from "@/lib/order-constants";

export { ORDER_STATUS, DELIVERY_PARTNER };
export type { OrderStatus, DeliveryPartner };

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  specifications: {
    voltage?: number;
    capacity?: number;
    variantId?: mongoose.Types.ObjectId;
    size?: string;
    color?: string;
  };
}

export interface IOrder {
  _id: mongoose.Types.ObjectId;
  orderId: string;
  userId?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCompany?: string;
  customerGst?: string;
  items: IOrderItem[];
  orderStatus: OrderStatus;
  deliveryPartner: DeliveryPartner;
  trackingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    specifications: {
      voltage: Number,
      capacity: Number,
      variantId: Schema.Types.ObjectId,
      size: String,
      color: String,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerAddress: { type: String, required: true, trim: true },
    customerCompany: { type: String, trim: true },
    customerGst: { type: String, trim: true },
    items: { type: [OrderItemSchema], required: true },
    orderStatus: {
      type: String,
      required: true,
      enum: ORDER_STATUS,
      default: "CREATED",
    },
    deliveryPartner: {
      type: String,
      required: true,
      enum: DELIVERY_PARTNER,
      default: "NONE",
    },
    trackingId: { type: String, trim: true },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>("Order", OrderSchema);
