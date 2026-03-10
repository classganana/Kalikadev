/**
 * GET /api/orders/mine - Fetch current user's orders.
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin id is "admin", not a MongoDB ObjectId
  if (token.id === "admin" && token.isAdmin) {
    return NextResponse.json(
      { error: "Use /api/orders for admin orders" },
      { status: 400 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(token.id as string)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  try {
    await connectDB();
    const orders = await Order.find({ userId: new mongoose.Types.ObjectId(token.id as string) })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      orders.map((o) => ({
        _id: o._id.toString(),
        orderId: o.orderId,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        orderStatus: o.orderStatus,
        deliveryPartner: o.deliveryPartner,
        trackingId: o.trackingId,
        createdAt: o.createdAt,
        items: o.items.map((i) => ({
          ...i,
          productId: i.productId.toString(),
        })),
      }))
    );
  } catch (error) {
    console.error("[GET /api/orders/mine]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
