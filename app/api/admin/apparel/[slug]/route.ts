/**
 * PATCH /api/admin/apparel/[slug] - Update apparel
 * DELETE /api/admin/apparel/[slug] - Delete apparel
 */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import { requireAdmin } from "@/lib/admin-auth";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    await connectDB();
    const { slug } = await params;
    const body = await request.json();

    const product = await Product.findOne({ slug, category: "apparel" });
    if (!product) {
      return NextResponse.json({ error: "Apparel product not found" }, { status: 404 });
    }

    const update: Record<string, unknown> = {};
    if (body.name != null) update.name = String(body.name).trim();
    if (body.description != null) update.description = String(body.description).trim();
    if (body.price != null) update.price = Number(body.price);
    if (body.variant != null) update.variant = String(body.variant).trim();
    if (body.images != null) update.images = Array.isArray(body.images) ? body.images.filter(Boolean) : [body.images];
    if (body.stock != null) update.stock = Math.max(0, Number(body.stock));

    if (Object.keys(update).length > 0) {
      await Product.updateOne({ slug, category: "apparel" }, { $set: update });
    }

    const updated = await Product.findOne({ slug, category: "apparel" }).lean();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/apparel/[slug]]", error);
    return NextResponse.json(
      { error: "Failed to update apparel" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin(_request);
  if (auth) return auth;

  try {
    await connectDB();
    const { slug } = await params;

    const product = await Product.findOne({ slug, category: "apparel" });
    if (!product) {
      return NextResponse.json({ error: "Apparel product not found" }, { status: 404 });
    }

    await Product.deleteOne({ slug, category: "apparel" });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/apparel/[slug]]", error);
    return NextResponse.json(
      { error: "Failed to delete apparel" },
      { status: 500 }
    );
  }
}
