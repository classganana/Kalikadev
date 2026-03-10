/**
 * Add new apparel product.
 */
import { ApparelForm } from "@/components/admin/apparel-form";
import Link from "next/link";

export default function NewApparelPage() {
  return (
    <div>
      <Link
        href="/admin/apparel"
        className="mb-6 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        ← Back to apparel
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Add Apparel
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Create a new apparel product.
      </p>
      <div className="mt-8">
        <ApparelForm />
      </div>
    </div>
  );
}
