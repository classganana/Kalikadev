/**
 * POST /api/admin/products - Create battery product.
 */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product, BatterySpecification } from "@/models";
import { requireAdmin } from "@/lib/admin-auth";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      slug: rawSlug,
      description,
      price,
      productType = "battery",
      variant,
      images,
      stock = 0,
      voltage,
      capacity,
      batteryType,
      warranty,
      connectorType,
    } = body;

    if (!name || !description || price == null || !images?.length) {
      return NextResponse.json(
        { error: "Name, description, price, and at least one image required" },
        { status: 400 }
      );
    }

    const type = productType === "apparel" ? "apparel" : "battery";

    if (type === "battery") {
      if (
        voltage == null ||
        capacity == null ||
        !batteryType?.trim() ||
        !warranty?.trim() ||
        !connectorType?.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "Battery spec (voltage, capacity, batteryType, warranty, connectorType) required",
          },
          { status: 400 }
        );
      }
    }

    const slug = rawSlug?.trim() ? slugify(rawSlug) : slugify(name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Product with this slug already exists" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      price: Number(price),
      category: type,
      productType: type,
      variant: (variant ?? (type === "apparel" ? "t-shirt" : "lithium")).trim(),
      images: Array.isArray(images) ? images.filter(Boolean) : [images],
      stock: Math.max(0, Number(stock) || 0),
    });

    if (type === "battery") {
      await BatterySpecification.create({
        productId: product._id,
        voltage: Number(voltage ?? 0),
        capacity: Number(capacity ?? 0),
        batteryType: (batteryType ?? "LiFePO4").trim(),
        warranty: (warranty ?? "").trim(),
        connectorType: (connectorType ?? "").trim(),
      });
    }

    const created = await Product.findById(product._id).lean();
    return NextResponse.json(created);
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
