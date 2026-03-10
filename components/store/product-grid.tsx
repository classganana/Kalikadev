/**
 * Product Grid - Responsive layout for product cards.
 * 1 col mobile, 2 tablet, 3 desktop. Generous spacing.
 */
import type { ProductCardProps } from "./product-card";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: ProductCardProps[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.slug} {...product} />
      ))}
    </div>
  );
}
