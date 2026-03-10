/**
 * GET /api/products/[slug] - Return single product by slug.
 * ?category=apparel - Fetch apparel product (404 when NEXT_PUBLIC_ENABLE_APPAREL=false).
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getProductBySlug,
  getApparelProductBySlug,
} from "@/lib/products";
import { isApparelEnabled } from "@/lib/feature-flags";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const category = request.nextUrl.searchParams.get("category");

    if (category === "apparel") {
      if (!isApparelEnabled) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      const product = await getApparelProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json(product);
    }

    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[GET /api/products/[slug]]", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
