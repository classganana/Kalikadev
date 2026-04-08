/**
 * Home page - KD Lithium Batteries landing.
 * Hero + products upfront. Server component.
 */
import { Metadata } from "next";
export const dynamic = "force-dynamic";
import { HeroSection } from "@/components/store/hero-section";
import { ProductGrid } from "@/components/store/product-grid";
import type { ProductCardProps } from "@/components/store/product-card";
import { getAllProducts, formatSpecSummary } from "@/lib/products";

export const metadata: Metadata = {
  title: "KD Lithium | Premium Lithium Batteries",
  description:
    "High-performance LiFePO4 batteries for solar, EVs, and energy storage. Built for reliability, backed by years of warranty.",
};

export default async function HomePage() {
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
    <>
      <HeroSection
        headline="KD Lithium Batteries"
        subheadline="High-performance LiFePO4 batteries for solar, EVs, and energy storage. Built for reliability, backed by years of warranty."
        ctaLabel="Explore Batteries"
        ctaHref="/batteries"
        secondaryLabel="About KD Lithium"
        secondaryHref="/about"
        imageSrc="https://images.pexels.com/photos/34800678/pexels-photo-34800678.jpeg?auto=compress&cs=tinysrgb&w=1600&fit=max"
        imageAlt="KD Lithium battery - premium energy storage"
      />

      <section
        id="products"
        aria-label="Lithium Batteries"
        className="border-t border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="mb-12">
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-zinc-900 sm:text-5xl dark:text-white">
              Lithium Batteries
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              High-performance, long-life lithium batteries for every application.
            </p>
          </div>

          {cardProducts.length > 0 ? (
            <ProductGrid products={cardProducts} />
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400">
              No products yet. Run{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
                npm run db:seed
              </code>{" "}
              to seed the database.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
