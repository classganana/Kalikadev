"use client";

/**
 * Cart page content - Product list, quantity selector, subtotal, checkout.
 * Premium UI consistent with store design.
 */
import Link from "next/link";
import { ProductImage } from "./product-image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";

function QuantitySelector({
  quantity,
  onUpdate,
  onRemove,
}: {
  quantity: number;
  onUpdate: (q: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onUpdate(quantity - 1)}
        className="flex size-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-white"
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" strokeWidth={1.5} />
      </button>
      <span className="min-w-[2rem] text-center text-sm font-medium">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onUpdate(quantity + 1)}
        className="flex size-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-white"
        aria-label="Increase quantity"
      >
        <Plus className="size-4" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="ml-2 flex size-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
        aria-label="Remove from cart"
      >
        <Trash2 className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}

export function CartPageClient() {
  const { items, isLoading, updateQuantity, removeItem } = useCart();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const formattedSubtotal = formatPrice(subtotal);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Your Cart
        </h1>
        <div className="mt-12 flex justify-center py-16">
          <div className="h-8 w-8 animate-pulse rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Your Cart
        </h1>
        <p className="mt-6 text-zinc-600 dark:text-zinc-400">
          Your cart is empty.{" "}
          <Link
            href="/batteries"
            className="font-semibold text-zinc-900 underline-offset-4 hover:underline dark:text-white"
          >
            Shop batteries
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Your Cart
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.map((item) => (
              <li
                key={`${item.productId}:${item.variantId ?? "base"}`}
                className="flex gap-6 py-8 first:pt-0 last:pb-0"
              >
                <Link
                  href={`${item.basePath ?? "/batteries"}/${item.productSlug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900"
                >
                  <ProductImage
                    src={item.image || "https://picsum.photos/96/96"}
                    alt={item.name}
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`${item.basePath ?? "/batteries"}/${item.productSlug}`}
                    className="font-semibold text-zinc-900 hover:underline dark:text-white"
                  >
                    {item.name}
                  </Link>
                  {(item.size || item.color) && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {[item.size, item.color].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                    {formatPrice(item.price)}
                  </p>
                  <div className="mt-3">
                    <QuantitySelector
                      quantity={item.quantity}
                      onUpdate={(q) =>
                        updateQuantity(item.productId, q, item.variantId ?? null)
                      }
                      onRemove={() => removeItem(item.productId, item.variantId ?? null)}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Subtotal
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary + Checkout */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Summary
            </h2>
            <div className="mt-4 flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {formattedSubtotal}
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all duration-300 hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/15 dark:bg-white dark:text-zinc-900 dark:shadow-zinc-950/20 dark:hover:bg-zinc-100"
            >
              Checkout
            </Link>
            <Link
              href="/batteries"
              className="mt-4 block text-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
