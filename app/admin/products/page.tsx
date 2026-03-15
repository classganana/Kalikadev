/**
 * Admin products list.
 */
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/store/product-image";
import { ProductsListActions } from "@/components/admin/products-list-actions";

export default async function AdminProductsPage() {
  let products: Array<{
    _id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    images: string[];
  }> = [];

  try {
    await connectDB();
    const items = await Product.find({ category: "battery" })
      .sort({ createdAt: -1 })
      .lean();
    products = items.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      price: p.price,
      stock: p.stock ?? 0,
      images: p.images,
    }));
  } catch {
    // DB error
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Add Product
        </Link>
      </div>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Manage battery products and inventory.
      </p>

      {products.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No products yet. Add your first battery product.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 dark:text-white"
          >
            Add Product →
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
                        <ProductImage
                          src={product.images[0] || "https://picsum.photos/48/48"}
                          alt={product.name}
                          className="object-cover"
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
                  <td className="px-6 py-4 text-right">
                    <ProductsListActions slug={product.slug} />
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
