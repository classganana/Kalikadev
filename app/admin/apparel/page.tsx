/**
 * Admin apparel list.
 */
import { connectDB } from "@/lib/db";
import { Product, ProductVariant } from "@/models";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { ApparelListActions } from "@/components/admin/apparel-list-actions";

export default async function AdminApparelPage() {
  let products: Array<{
    _id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    images: string[];
    variantCount: number;
  }> = [];

  try {
    await connectDB();
    const items = await Product.find({ category: "apparel" })
      .sort({ createdAt: -1 })
      .lean();
    const productIds = items.map((p) => p._id);
    const variantCounts = await ProductVariant.aggregate([
      { $match: { productId: { $in: productIds } } },
      { $group: { _id: "$productId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      variantCounts.map((c) => [c._id.toString(), c.count])
    );
    products = items.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      price: p.price,
      stock: p.stock ?? 0,
      images: p.images,
      variantCount: countMap.get(p._id.toString()) ?? 0,
    }));
  } catch {
    // DB error
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Apparel
        </h1>
        <Link
          href="/admin/apparel/new"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Add Apparel
        </Link>
      </div>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Manage apparel products. Store visibility controlled by NEXT_PUBLIC_ENABLE_APPAREL.
      </p>

      {products.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No apparel products yet.
          </p>
          <Link
            href="/admin/apparel/new"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 dark:text-white"
          >
            Add Apparel →
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Variants
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-zinc-200 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Image
                          src={product.images[0] || "https://picsum.photos/48/48"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          /{product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.stock < 5
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {product.variantCount} {product.variantCount === 1 ? "variant" : "variants"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ApparelListActions slug={product.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
