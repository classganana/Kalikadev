/**
 * Apparel product detail - Feature-flagged. 404 when NEXT_PUBLIC_ENABLE_APPAREL=false.
 */
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getApparelProductBySlug,
  getVariantsByProductId,
} from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/seo";
import { ProductGallery } from "@/components/store/product-gallery";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductJsonLd } from "@/components/seo/json-ld";
import { isApparelEnabled } from "@/lib/feature-flags";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  if (!isApparelEnabled) {
    return { title: "Not Found" };
  }
  const { slug } = await params;
  const product = await getApparelProductBySlug(slug);

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

export default async function ApparelDetailPage({ params }: PageProps) {
  if (!isApparelEnabled) {
    notFound();
  }

  const { slug } = await params;
  const product = await getApparelProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const variants = await getVariantsByProductId(product._id);

  const hasVariants = variants.length > 0;
  const minPrice = hasVariants
    ? Math.min(...variants.map((v) => v.price))
    : product.price;
  const totalStock = hasVariants
    ? variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
    : product.stock ?? 0;
  const displayPrice = hasVariants
    ? `From ${formatPrice(minPrice)}`
    : formatPrice(product.price);
  const productUrl = `${siteConfig.url}/apparel/${product.slug}`;

  return (
    <>
      <ProductJsonLd
        name={product.name}
        description={product.description}
        image={product.images}
        price={minPrice}
        url={productUrl}
        availability={totalStock > 0 ? "InStock" : "OutOfStock"}
        sku={product.slug}
      />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-zinc-900 dark:text-white sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-white">
            {displayPrice}
          </p>
          {!hasVariants && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {product.variant}
            </p>
          )}
          <p className="mt-6 leading-relaxed text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCartButton
              productSlug={product.slug}
              productName={product.name}
              variants={variants.map((v) => ({
                _id: v._id,
                size: v.size,
                color: v.color,
                price: v.price,
                stock: v.stock,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
