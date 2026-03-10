"use client";

/**
 * Cart icon with item count - for navbar.
 */
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

export function CartIcon() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center rounded-full p-2.5 text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
      aria-label={`Shopping cart${count > 0 ? `, ${count} items` : ""}`}
    >
      <ShoppingCart className="size-5" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-medium text-white dark:bg-white dark:text-zinc-900">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
