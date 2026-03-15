/**
 * Product Card - Elegant product display with hover states.
 * Image, name, spec, price. Lightweight Tailwind transitions.
 */
import Link from "next/link";
import { ProductImage } from "./product-image";
import { formatPrice } from "@/lib/utils";

export interface ProductCardProps {
  slug: string;
  name: string;
  specification: string;
  price: number;
  imageSrc: string;
  imageAlt: string;
  /** Base path for the product link (default: /batteries) */
  basePath?: string;
}

export function ProductCard({
  slug,
  name,
  specification,
  price,
  imageSrc,
  imageAlt,
  basePath = "/batteries",
}: ProductCardProps) {
  return (
    <Link
      href={`${basePath}/${slug}`}
      className="group block"
    >
      <article className="flex flex-col">
        {/* Image container - hover scale + shadow */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-zinc-900/5 dark:bg-zinc-900 dark:group-hover:shadow-zinc-950/50">
          <ProductImage
            src={imageSrc}
            alt={imageAlt}
            className="transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="mt-6 flex flex-col gap-1">
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-zinc-900 transition-colors duration-200 group-hover:text-zinc-600 dark:text-white dark:group-hover:text-zinc-300">
            {name}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {specification}
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
            {formatPrice(price)}
          </p>
        </div>
      </article>
    </Link>
  );
}
