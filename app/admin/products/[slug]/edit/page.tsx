/**
 * Edit product.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products";
import { ProductForm } from "@/components/admin/product-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-6 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        ← Back to products
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Edit Product
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {product.name}
      </p>
      <div className="mt-8">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
