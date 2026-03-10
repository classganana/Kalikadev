"use client";

/**
 * Cart context - Guest (localStorage) + Logged-in (MongoDB via API).
 * Supports apparel variants: battery items use variantId=null, apparel requires variantId.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { CART_STORAGE_KEY } from "@/lib/cart-storage-key";

export interface CartItem {
  productId: string;
  productSlug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string | null;
  voltage?: number;
  capacity?: number;
  size?: string;
  color?: string;
  basePath?: string;
}

interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  addItem: (productSlug: string, quantity?: number, variantId?: string | null) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => Promise<void>;
  removeItem: (productId: string, variantId?: string | null) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

interface GuestCartEntry {
  productSlug: string;
  variantId?: string | null;
  quantity: number;
}

function parseGuestCart(): GuestCartEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: GuestCartEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (status === "loading") return;

    if (session?.user?.id) {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        setItems([]);
      }
    } else {
      const guest = parseGuestCart();
      if (guest.length === 0) {
        setItems([]);
      } else {
        const batteryEntries = guest.filter((g) => !g.variantId);
        const apparelEntries = guest.filter((g) => g.variantId);

        const merged: CartItem[] = [];

        if (batteryEntries.length > 0) {
          const slugs = batteryEntries.map((g) => g.productSlug).join(",");
          const res = await fetch(`/api/products?slugs=${encodeURIComponent(slugs)}`);
          if (res.ok) {
            const products = await res.json();
            for (const g of batteryEntries) {
              const p = products.find((x: { slug: string }) => x.slug === g.productSlug);
              if (!p) continue;
              merged.push({
                productId: p._id,
                productSlug: p.slug,
                name: p.name,
                price: p.price,
                image: p.images?.[0] ?? "",
                quantity: g.quantity,
                variantId: null,
                voltage: p.voltage,
                capacity: p.capacity,
                basePath: "/batteries",
              });
            }
          }
        }

        for (const g of apparelEntries) {
          if (!g.variantId) continue;
          const res = await fetch(`/api/variants/by-id/${g.variantId}`);
          if (!res.ok) continue;
          const v = await res.json();
          merged.push({
            productId: v.productId,
            productSlug: v.productSlug ?? "",
            name: v.productName ?? "",
            price: v.price ?? 0,
            image: v.productImages?.[0] ?? "",
            quantity: g.quantity,
            variantId: g.variantId,
            size: v.size,
            color: v.color,
            basePath: "/apparel",
          });
        }

        setItems(merged);
      }
    }
    setIsLoading(false);
  }, [session?.user?.id, status]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (productSlug: string, quantity = 1, variantId?: string | null) => {
      if (session?.user?.id) {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productSlug, quantity, variantId: variantId ?? null }),
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } else {
        const guest = parseGuestCart();
        const vid = variantId ?? null;
        const existing = guest.find(
          (x) => x.productSlug === productSlug && (x.variantId ?? null) === vid
        );
        if (existing) {
          existing.quantity += quantity;
        } else {
          guest.push({ productSlug, variantId: vid, quantity });
        }
        saveGuestCart(guest);
        await fetchCart();
      }
    },
    [session?.user?.id, fetchCart]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number, variantId?: string | null) => {
      if (session?.user?.id) {
        const res = await fetch(`/api/cart/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity, variantId: variantId ?? null }),
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } else {
        const item = items.find(
          (i) => i.productId === productId && (i.variantId ?? null) === (variantId ?? null)
        );
        if (!item) return;
        const guest = parseGuestCart();
        const idx = guest.findIndex(
          (g) =>
            g.productSlug === item.productSlug &&
            (g.variantId ?? null) === (item.variantId ?? null)
        );
        if (idx >= 0) {
          if (quantity < 1) {
            guest.splice(idx, 1);
          } else {
            guest[idx].quantity = quantity;
          }
          saveGuestCart(guest);
          await fetchCart();
        }
      }
    },
    [session?.user?.id, items, fetchCart]
  );

  const removeItem = useCallback(
    async (productId: string, variantId?: string | null) => {
      if (session?.user?.id) {
        const res = await fetch(`/api/cart/${productId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: variantId ?? null }),
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } else {
        const item = items.find(
          (i) => i.productId === productId && (i.variantId ?? null) === (variantId ?? null)
        );
        if (!item) return;
        const guest = parseGuestCart().filter(
          (g) =>
            !(g.productSlug === item.productSlug && (g.variantId ?? null) === (item.variantId ?? null))
        );
        saveGuestCart(guest);
        await fetchCart();
      }
    },
    [session?.user?.id, items, fetchCart]
  );

  const value = useMemo(
    () => ({
      items,
      isLoading,
      addItem,
      updateQuantity,
      removeItem,
      refresh: fetchCart,
    }),
    [items, isLoading, addItem, updateQuantity, removeItem, fetchCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
