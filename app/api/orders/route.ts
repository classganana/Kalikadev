/**
 * POST /api/orders - Create order (checkout)
 * GET /api/orders - Admin fetch orders
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { createOrder } from "@/lib/orders";
import { isValidGSTIN } from "@/lib/gstin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      customerCompany,
      customerGst,
      items,
    } = body;

    if (!customerName?.trim() || !customerPhone?.trim() || !customerAddress?.trim()) {
      return NextResponse.json(
        { error: "Customer name, phone, and address are required" },
        { status: 400 }
      );
    }

    if (!customerCompany?.trim() || !customerGst?.trim()) {
      return NextResponse.json(
        { error: "Company name and GSTIN are required" },
        { status: 400 }
      );
    }

    // Validate Indian mobile: 10 digits starting with 6/7/8/9, optional 91 prefix
    const phoneDigits = String(customerPhone).replace(/\D/g, "");
    const isValidPhone =
      /^[6-9]\d{9}$/.test(phoneDigits) || /^91[6-9]\d{9}$/.test(phoneDigits);
    if (!isValidPhone) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    // Validate GSTIN: official format + Luhn mod 36 checksum
    if (!isValidGSTIN(String(customerGst))) {
      return NextResponse.json(
        { error: "Enter a valid 15-character GSTIN (format: 2 digits + 5 letters + 4 digits + 1 letter + entity + Z + check digit)" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one order item is required" },
        { status: 400 }
      );
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const userId = token?.id as string | undefined;

    const orderItems = items.map(
      (i: {
        productId: string;
        productName: string;
        quantity: number;
        price: number;
        voltage?: number;
        capacity?: number;
        variantId?: string;
        size?: string;
        color?: string;
      }) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: Number(i.quantity) || 1,
        price: Number(i.price) || 0,
        voltage: i.voltage,
        capacity: i.capacity,
        variantId: i.variantId,
        size: i.size,
        color: i.color,
      })
    );

    const order = await createOrder({
      userId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerCompany: customerCompany?.trim(),
      customerGst: customerGst?.trim(),
      items: orderItems,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const orders = await Order.find()
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
        createdAt: o.createdAt,
      }))
    );
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
