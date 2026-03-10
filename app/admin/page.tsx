/**
 * Admin dashboard.
 */
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  let productCount = 0;
  let totalValue = 0;
  try {
    await connectDB();
    const items = await Product.find({ category: "battery" }).lean();
    productCount = items.length;
    totalValue = items.reduce(
      (sum, p) => sum + (p.price ?? 0) * (p.stock ?? 0),
      0
    );
  } catch {
    // DB not available
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Dashboard
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Manage your battery products and inventory.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Products
          </h2>
          <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
            {productCount}
          </p>
          <Link
            href="/admin/products"
            className="mt-4 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            View all →
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Inventory Value
          </h2>
          <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
            {formatPrice(totalValue)}
          </p>
          <Link
            href="/admin/products"
            className="mt-4 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Manage inventory →
          </Link>
        </div>
      </div>
    </div>
  );
}
