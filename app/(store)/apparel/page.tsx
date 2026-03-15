/**
 * Apparel catalog - Feature-flagged. 404 when NEXT_PUBLIC_ENABLE_APPAREL=false.
 */
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApparelProducts } from "@/lib/products";
import { ProductGrid } from "@/components/store/product-grid";
import type { ProductCardProps } from "@/components/store/product-card";
import { isApparelEnabled } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apparel",
  description: "Premium KD Lithium apparel and merchandise.",
  openGraph: {
    title: "Apparel | KD Lithium",
    description: "Premium KD Lithium apparel and merchandise.",
  },
};

export default async function ApparelPage() {
  if (!isApparelEnabled) {
    notFound();
  }

  const products = await getApparelProducts();

  const cardProducts: ProductCardProps[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    specification: p.variant,
    price: p.price,
    imageSrc: p.images[0] ?? "https://picsum.photos/600/600",
    imageAlt: `${p.name} - apparel`,
    basePath: "/apparel",
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div className="mb-16">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-zinc-900 sm:text-5xl dark:text-white">
          Apparel
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Premium KD Lithium apparel and merchandise.
        </p>
      </div>

      {cardProducts.length > 0 ? (
        <ProductGrid products={cardProducts} />
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400">
          No apparel products yet. Add some in the admin panel.
        </p>
      )}
    </div>
  );
}
