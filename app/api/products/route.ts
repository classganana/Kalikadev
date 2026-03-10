/**
 * GET /api/products - Return products.
 * ?slugs=slug1,slug2 - Return specific products by slug (for cart).
 * ?category=apparel - Return apparel products (empty when NEXT_PUBLIC_ENABLE_APPAREL=false).
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  getProductsBySlugs,
  getApparelProducts,
} from "@/lib/products";
import { isApparelEnabled } from "@/lib/feature-flags";

export async function GET(request: NextRequest) {
  try {
    const slugs = request.nextUrl.searchParams.get("slugs");
    const category = request.nextUrl.searchParams.get("category");

    if (slugs) {
      const slugList = slugs.split(",").map((s) => s.trim()).filter(Boolean);
      const products = await getProductsBySlugs(slugList);
      return NextResponse.json(products);
    }

    if (category === "apparel") {
      if (!isApparelEnabled) {
        return NextResponse.json([]);
      }
      const products = await getApparelProducts();
      return NextResponse.json(products);
    }

    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
