/**
 * Battery detail page - Product gallery, specs, add to cart.
 * Server component with SEO metadata.
 */
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, formatSpecSummary } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { ProductGallery } from "@/components/store/product-gallery";
import { SpecTable } from "@/components/store/spec-table";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Kalikadev`,
      description: product.description,
      images: product.images.length > 0 ? [product.images[0]] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
    },
  };
}

export default async function BatteryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const price = formatPrice(product.price);

  const specRows = product.specification
    ? [
        { label: "Voltage", value: `${product.specification.voltage}V` },
        { label: "Capacity", value: `${product.specification.capacity}Ah` },
        {
          label: "Energy",
          value: `${((product.specification.voltage * product.specification.capacity) / 1000).toFixed(2)} kWh`,
        },
        { label: "Battery Type", value: product.specification.batteryType },
        { label: "Warranty", value: product.specification.warranty },
        { label: "Connector", value: product.specification.connectorType },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-zinc-900 dark:text-white sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-white">
            {price}
          </p>
          {product.specification && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {formatSpecSummary(product.specification)}
            </p>
          )}
          <p className="mt-6 leading-relaxed text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCartButton
              productSlug={product.slug}
              productName={product.name}
            />
          </div>

          {specRows.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                Specifications
              </h2>
              <SpecTable specs={specRows} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
