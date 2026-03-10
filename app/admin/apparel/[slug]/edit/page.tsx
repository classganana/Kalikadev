/**
 * Edit apparel product.
 */
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import { notFound } from "next/navigation";
import { ApparelForm } from "@/components/admin/apparel-form";
import { VariantManager } from "@/components/admin/variant-manager";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditApparelPage({ params }: PageProps) {
  const { slug } = await params;

  let product: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    variant: string;
    images: string[];
    stock: number;
  } | null = null;

  try {
    await connectDB();
    const doc = await Product.findOne({ slug, category: "apparel" }).lean();
    if (doc) {
      product = {
        _id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        price: doc.price,
        variant: (doc as { variant?: string }).variant ?? doc.productType ?? "t-shirt",
        images: doc.images,
        stock: doc.stock ?? 0,
      };
    }
  } catch {
    // DB error
  }

  if (!product) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/apparel"
        className="mb-6 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        ← Back to apparel
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Edit Apparel
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {product.name}
      </p>
      <div className="mt-8 space-y-8">
        <ApparelForm product={product} />
        <VariantManager
          productId={product._id}
          productName={product.name}
        />
      </div>
    </div>
  );
}
