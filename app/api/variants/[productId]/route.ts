/**
 * GET /api/variants/[productId] - Fetch variants for an apparel product.
 * Returns empty array if product is not apparel or has no variants.
 */
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product, ProductVariant } from "@/models";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { productId } = await params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(productId)
      .select("productType category")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.productType !== "apparel" && product.category !== "apparel") {
      return NextResponse.json([]);
    }

    const variants = await ProductVariant.find({
      productId: new mongoose.Types.ObjectId(productId),
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      variants.map((v) => ({
        _id: v._id.toString(),
        productId: v.productId.toString(),
        size: v.size,
        color: v.color,
        price: v.price,
        stock: v.stock,
        sku: v.sku,
        createdAt: v.createdAt,
      }))
    );
  } catch (error) {
    console.error("[GET /api/variants/[productId]]", error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}
