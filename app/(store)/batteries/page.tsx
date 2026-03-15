/**
 * Batteries catalog - Server component, fetches from MongoDB.
 * Dynamic to allow builds without DB connection.
 */
import { Metadata } from "next";
export const dynamic = "force-dynamic";
import { getAllProducts, formatSpecSummary } from "@/lib/products";
import { ProductGrid } from "@/components/store/product-grid";
import type { ProductCardProps } from "@/components/store/product-card";

export const metadata: Metadata = {
  title: "Lithium Batteries",
  description:
    "High-performance, long-life lithium batteries for every application. Power Cell Pro, Compact Energy, and more.",
  openGraph: {
    title: "Lithium Batteries | KD Lithium",
    description:
      "High-performance, long-life lithium batteries for every application.",
  },
};

export default async function BatteriesPage() {
  const products = await getAllProducts();

  const cardProducts: ProductCardProps[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    specification: p.specification
      ? formatSpecSummary(p.specification)
      : p.variant,
    price: p.price,
    imageSrc: p.images[0],
    imageAlt: `${p.name} - lithium battery`,
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div className="mb-16">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-zinc-900 sm:text-5xl dark:text-white">
          Lithium Batteries
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          High-performance, long-life lithium batteries for every application.
        </p>
      </div>

      {cardProducts.length > 0 ? (
        <ProductGrid products={cardProducts} />
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400">
          No products yet. Run <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">npm run db:seed</code> to seed the database.
        </p>
      )}
    </div>
  );
}
