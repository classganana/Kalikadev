/**
 * POST /api/admin/variants - Create variant for apparel product.
 */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product, ProductVariant } from "@/models";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    await connectDB();

    const body = await request.json();
    const { productId, size, color, price, stock, sku } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.productType !== "apparel" && product.category !== "apparel") {
      return NextResponse.json(
        { error: "Variants only apply to apparel products" },
        { status: 400 }
      );
    }

    if (!size?.trim() || !color?.trim()) {
      return NextResponse.json(
        { error: "size and color are required" },
        { status: 400 }
      );
    }

    if (price == null || Number(price) < 0) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    const stockNum = Math.max(0, Number(stock) || 0);

    if (sku?.trim()) {
      const existingSku = await ProductVariant.findOne({
        sku: String(sku).trim(),
      });
      if (existingSku) {
        return NextResponse.json(
          { error: "SKU already exists" },
          { status: 400 }
        );
      }
    }

    const variant = await ProductVariant.create({
      productId: new mongoose.Types.ObjectId(productId),
      size: String(size).trim(),
      color: String(color).trim(),
      price: Number(price),
      stock: stockNum,
      sku: sku?.trim() || undefined,
    });

    const created = await ProductVariant.findById(variant._id).lean();
    return NextResponse.json({
      ...created,
      _id: created!._id.toString(),
      productId: created!.productId.toString(),
    });
  } catch (error) {
    console.error("[POST /api/admin/variants]", error);
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 }
    );
  }
}
