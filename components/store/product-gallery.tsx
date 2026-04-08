/**
 * Product Gallery - Main image + thumbnails.
 * Server component. Thumbnails switch main image (client interactivity TBD).
 * For now displays main image; full gallery needs client state for selection.
 */
"use client";

import { useState } from "react";
import { ProductImage } from "./product-image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const validImages = images.filter((src) => typeof src === "string" && src.trim().length > 0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImage = validImages[selectedIndex] ?? validImages[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
        <ProductImage
          src={mainImage}
          alt={`${productName} - image ${selectedIndex + 1}`}
          className="object-cover"
        />
      </div>
      {validImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {validImages.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                selectedIndex === i
                  ? "ring-2 ring-zinc-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-950"
                  : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <ProductImage
                src={src}
                alt=""
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
