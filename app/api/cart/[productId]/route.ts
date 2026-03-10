/**
 * PATCH /api/cart/[productId] - Update quantity (body: { quantity, variantId? })
 * DELETE /api/cart/[productId] - Remove item (body: { variantId? })
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getCartForUser,
  updateCartQuantity,
  removeFromCart,
} from "@/lib/cart";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return (token?.id as string) ?? null;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId(request);
    if (!userId || userId === "admin") {
      return NextResponse.json({ error: "Sign in to update cart" }, { status: 401 });
    }
    if (!/^[a-f0-9]{24}$/i.test(userId)) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const { productId } = await params;
    const body = await request.json();
    const quantity = Number(body.quantity ?? 1);
    const variantId = body.variantId ?? null;

    await updateCartQuantity(userId, productId, quantity, variantId);
    const items = await getCartForUser(userId);
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
    const userId = await getUserId(request);
    if (!userId || userId === "admin") {
      return NextResponse.json({ error: "Sign in to update cart" }, { status: 401 });
    }
    if (!/^[a-f0-9]{24}$/i.test(userId)) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const { productId } = await params;
    let variantId: string | null = null;
    try {
      const body = await request.json();
      variantId = body?.variantId ?? null;
    } catch {
      // No body - assume battery (variantId null)
    }

    await removeFromCart(userId, productId, variantId);
    const items = await getCartForUser(userId);
    return NextResponse.json(items);
  } catch (error) {
    console.error("[DELETE /api/cart/[productId]]", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
