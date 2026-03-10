/**
 * GET /api/orders/[id] - Fetch single order (admin)
 * PATCH /api/orders/[id] - Update order (admin)
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { ORDER_STATUS, DELIVERY_PARTNER } from "@/lib/order-constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Non-admin can only view their own orders
    if (!token.isAdmin) {
      const orderUserId = order.userId?.toString();
      if (!orderUserId || orderUserId !== token.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({
      ...order,
      _id: order._id.toString(),
      userId: order.userId?.toString(),
      items: order.items.map((i) => ({
        ...i,
        productId: i.productId.toString(),
      })),
    });
  } catch (error) {
    console.error("[GET /api/orders/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await request.json();
    const { orderStatus, deliveryPartner, trackingId } = body;

    const update: Record<string, unknown> = {};
    if (orderStatus && (ORDER_STATUS as readonly string[]).includes(orderStatus)) {
      update.orderStatus = orderStatus;
    }
    if (deliveryPartner && (DELIVERY_PARTNER as readonly string[]).includes(deliveryPartner)) {
      update.deliveryPartner = deliveryPartner;
    }
    if (trackingId !== undefined) {
      update.trackingId = String(trackingId).trim() || undefined;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...order,
      _id: order._id.toString(),
      userId: order.userId?.toString(),
      items: order.items.map((i) => ({
        ...i,
        productId: i.productId.toString(),
      })),
    });
  } catch (error) {
    console.error("[PATCH /api/orders/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
