"use client";

/**
 * Add to Cart button - Integrates with cart context.
 * Battery: no variant required. Apparel: variant (size/color) required.
 */
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";

export interface ApparelVariant {
  _id: string;
  size?: string;
  color?: string;
  price: number;
  stock?: number;
}

interface AddToCartButtonProps {
  productSlug: string;
  productName: string;
  disabled?: boolean;
  /** For apparel: variants to choose from. When provided, user must select variant before adding. */
  variants?: ApparelVariant[];
}

export function AddToCartButton({
  productSlug,
  productName,
  disabled = false,
  variants,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const isApparel = variants !== undefined;
  const hasVariants = variants && variants.length > 0;
  const noVariantsAvailable = isApparel && !hasVariants;

  const sizes = hasVariants
    ? Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[]
    : [];
  const colors = hasVariants
    ? Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[]
    : [];

  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes.length === 1 ? sizes[0] : null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length === 1 ? colors[0] : null
  );

  const selectedVariant = hasVariants && selectedSize && selectedColor
    ? variants.find(
        (v) =>
          (v.size ?? "") === selectedSize && (v.color ?? "") === selectedColor
      )
    : null;
  const selectedVariantId = selectedVariant?._id ?? null;
  const canAdd = !isApparel || (hasVariants && !!selectedVariantId && (selectedVariant?.stock ?? 0) > 0);

  const handleClick = async () => {
    if (isAdding || disabled || !canAdd) return;
    setIsAdding(true);
    try {
      await addItem(productSlug, 1, isApparel ? selectedVariantId : undefined);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {noVariantsAvailable && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No variants available. Please check back later.
        </p>
      )}
      {isApparel && hasVariants && (
        <div className="space-y-4">
          {sizes.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const selected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                          : "border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-500"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {colors.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const selected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                          : "border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-500"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {selectedSize && selectedColor && !selectedVariant && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              This combination is not available.
            </p>
          )}
          {selectedVariant && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {formatPrice(selectedVariant.price)}
              {(selectedVariant.stock ?? 0) === 0 && (
                <span className="ml-2 text-amber-600 dark:text-amber-400">
                  — Out of stock
                </span>
              )}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={disabled || isAdding || !canAdd || noVariantsAvailable}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all duration-300 hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/15 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:shadow-zinc-950/20 dark:hover:bg-zinc-100"
        onClick={handleClick}
        aria-label={`Add ${productName} to cart`}
      >
        <ShoppingCart className="size-5" strokeWidth={1.5} />
        {noVariantsAvailable
          ? "No variants available"
          : !canAdd && isApparel
            ? "Select a variant"
            : isAdding
              ? "Adding…"
              : "Add to Cart"}
      </button>
    </div>
  );
}
