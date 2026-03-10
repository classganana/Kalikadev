/**
 * PATCH /api/cart/[productId] - Update quantity (body: { quantity, variantId? })
 * DELETE /api/cart/[productId] - Remove item (body: { variantId? })
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getCartForUser,
  updateCartQuantity,
  removeFromCart,
} from "@/lib/cart";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to update cart" }, { status: 401 });
    }

    const { productId } = await params;
    const body = await request.json();
    const quantity = Number(body.quantity ?? 1);
    const variantId = body.variantId ?? null;

    await updateCartQuantity(session.user.id, productId, quantity, variantId);
    const items = await getCartForUser(session.user.id);
    return NextResponse.json(items);
  } catch (error) {
    console.error("[PATCH /api/cart/[productId]]", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to update cart" }, { status: 401 });
    }

    const { productId } = await params;
    let variantId: string | null = null;
    try {
      const body = await request.json();
      variantId = body?.variantId ?? null;
    } catch {
      // No body - assume battery (variantId null)
    }

    await removeFromCart(session.user.id, productId, variantId);
    const items = await getCartForUser(session.user.id);
    return NextResponse.json(items);
  } catch (error) {
    console.error("[DELETE /api/cart/[productId]]", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
