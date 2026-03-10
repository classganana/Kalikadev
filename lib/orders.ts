/**
 * Order data access and helpers.
 */
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";

/** Generate human-readable order ID (e.g. ORD-A1B2C3D4) */
export function generateOrderId(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "ORD-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export interface CreateOrderInput {
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCompany?: string;
  customerGst?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    voltage?: number;
    capacity?: number;
    variantId?: string;
    size?: string;
    color?: string;
  }>;
}

export async function createOrder(input: CreateOrderInput) {
  await connectDB();

  let orderId: string;
  let exists = true;
  while (exists) {
    orderId = generateOrderId();
    const found = await Order.findOne({ orderId });
    exists = !!found;
  }

  const order = await Order.create({
    orderId: orderId!,
    userId: input.userId ? new mongoose.Types.ObjectId(input.userId) : undefined,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerAddress: input.customerAddress,
    customerCompany: input.customerCompany,
    customerGst: input.customerGst,
    items: input.items.map((item) => ({
      productId: new mongoose.Types.ObjectId(item.productId),
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      specifications: {
        voltage: item.voltage,
        capacity: item.capacity,
        variantId: item.variantId
          ? new mongoose.Types.ObjectId(item.variantId)
          : undefined,
        size: item.size,
        color: item.color,
      },
    })),
    orderStatus: "CREATED",
    deliveryPartner: "NONE",
  });

  const doc = order.toObject();
  return {
    ...doc,
    _id: doc._id.toString(),
    orderId: doc.orderId,
  };
}
