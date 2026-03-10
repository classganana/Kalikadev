/**
 * PATCH /api/admin/variants/[id] - Update variant
 * DELETE /api/admin/variants/[id] - Delete variant
 */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product, ProductVariant } from "@/models";
import { requireAdmin } from "@/lib/admin-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid variant ID" }, { status: 400 });
    }

    await connectDB();

    const variant = await ProductVariant.findById(id);
    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const product = await Product.findById(variant.productId).lean();
    if (!product || (product.productType !== "apparel" && product.category !== "apparel")) {
      return NextResponse.json(
        { error: "Variants only apply to apparel products" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (body.size != null) update.size = String(body.size).trim();
    if (body.color != null) update.color = String(body.color).trim();
    if (body.price != null) update.price = Number(body.price);
    if (body.stock != null) update.stock = Math.max(0, Number(body.stock));
    if (body.sku !== undefined) update.sku = String(body.sku).trim() || undefined;

    if (update.sku) {
      const existingSku = await ProductVariant.findOne({
        sku: update.sku as string,
        _id: { $ne: id },
      });
      if (existingSku) {
        return NextResponse.json(
          { error: "SKU already exists" },
          { status: 400 }
        );
      }
    }

    if (Object.keys(update).length > 0) {
      await ProductVariant.updateOne({ _id: id }, { $set: update });
    }

    const updated = await ProductVariant.findById(id).lean();
    return NextResponse.json({
      ...updated,
      _id: updated!._id.toString(),
      productId: updated!.productId.toString(),
    });
  } catch (error) {
    console.error("[PATCH /api/admin/variants/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update variant" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin(_request);
  if (auth) return auth;

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid variant ID" }, { status: 400 });
    }

    await connectDB();

    const variant = await ProductVariant.findById(id);
    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const product = await Product.findById(variant.productId).lean();
    if (!product || (product.productType !== "apparel" && product.category !== "apparel")) {
      return NextResponse.json(
        { error: "Variants only apply to apparel products" },
        { status: 400 }
      );
    }

    await ProductVariant.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/variants/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 }
    );
  }
}
