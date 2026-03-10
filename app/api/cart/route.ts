/**
 * GET /api/cart - Fetch cart for logged-in user.
 * POST /api/cart - Add item (body: { productId or productSlug, quantity? })
 */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCartForUser, addToCart } from "@/lib/cart";
import { Product } from "@/models";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    const items = await getCartForUser(session.user.id);
    return NextResponse.json(items);
  } catch (error) {
    console.error("[GET /api/cart]", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Sign in to save cart" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { productId, productSlug, variantId, quantity = 1 } = body;

    let resolvedProductId = productId;
    if (!resolvedProductId && productSlug) {
      const product = await Product.findOne({ slug: productSlug })
        .select("_id category productType")
        .lean();
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      resolvedProductId = product._id.toString();

      const isApparel =
        product.category === "apparel" || product.productType === "apparel";
      if (isApparel && !variantId) {
        return NextResponse.json(
          { error: "variantId is required for apparel products" },
          { status: 400 }
        );
      }
    }

    if (!resolvedProductId) {
      return NextResponse.json(
        { error: "productId or productSlug required" },
        { status: 400 }
      );
    }

    await addToCart(
      session.user.id,
      resolvedProductId,
      quantity,
      variantId ?? null
    );
    const items = await getCartForUser(session.user.id);
    return NextResponse.json(items);
  } catch (error) {
    console.error("[POST /api/cart]", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}
