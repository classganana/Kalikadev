/**
 * ProductImage - Uses native <img> to support any image URL domain.
 * Use this for product images (user-uploaded, external URLs). next/image
 * requires hostnames to be configured; ProductImage works with any URL.
 */
"use client";

const FALLBACK_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect fill='%23e4e4e7' width='96' height='96'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2371717a' font-size='12'%3E?%3C/text%3E%3C/svg%3E";

function resolveSrc(src: string): string {
  if (!src || src.startsWith("http")) return src;
  return src.startsWith("/") ? src : `/${src.replace(/^\//, "")}`;
}

export interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  className = "",
  fill = true,
}: ProductImageProps) {
  const resolved = resolveSrc(src);

  return (
    <img
      src={resolved || FALLBACK_SRC}
      alt={alt}
      className={fill ? `absolute inset-0 size-full object-cover ${className}` : `object-cover ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = FALLBACK_SRC;
      }}
      loading="lazy"
      decoding="async"
    />
  );
}
