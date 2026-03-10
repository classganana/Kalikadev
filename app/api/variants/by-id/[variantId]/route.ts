/**
 * GET /api/variants/by-id/[variantId] - Fetch single variant by ID.
 */
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { ProductVariant } from "@/models";

interface RouteParams {
  params: Promise<{ variantId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { variantId } = await params;

    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      return NextResponse.json({ error: "Invalid variant ID" }, { status: 400 });
    }

    await connectDB();

    const variant = await ProductVariant.findById(variantId)
      .populate("productId", "slug name images category productType")
      .lean();

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const product = variant.productId as unknown as {
      _id: unknown;
      slug: string;
      name: string;
      images: string[];
    };

    return NextResponse.json({
      _id: variant._id.toString(),
      productId: variant.productId.toString(),
      size: variant.size,
      color: variant.color,
      price: variant.price,
      stock: variant.stock,
      sku: variant.sku,
      productSlug: product?.slug,
      productName: product?.name,
      productImages: product?.images,
    });
  } catch (error) {
    console.error("[GET /api/variants/by-id/[variantId]]", error);
    return NextResponse.json(
      { error: "Failed to fetch variant" },
      { status: 500 }
    );
  }
}
