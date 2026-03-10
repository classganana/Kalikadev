"use client";

/**
 * Apparel product form - Add and edit (no battery specs).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ApparelFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  variant: string;
  images: string;
  stock: string;
}

interface ApparelFormProps {
  product?: {
    name: string;
    slug: string;
    description: string;
    price: number;
    variant: string;
    images: string[];
    stock: number;
  };
}

const defaultForm: ApparelFormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  variant: "t-shirt",
  images: "",
  stock: "0",
};

export function ApparelForm({ product }: ApparelFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ApparelFormData>(
    product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: String(product.price),
          variant: product.variant,
          images: product.images.join("\n"),
          stock: String(product.stock ?? 0),
        }
      : defaultForm
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key: keyof ApparelFormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const images = form.images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (images.length === 0) {
      setError("At least one image URL is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim(),
        price: Number(form.price),
        variant: form.variant.trim(),
        images,
        stock: Number(form.stock) || 0,
      };

      if (product) {
        const res = await fetch(`/api/admin/apparel/${product.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to update");
        }
        router.push("/admin/apparel");
      } else {
        const res = await fetch("/api/admin/apparel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to create");
        }
        router.push("/admin/apparel");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Apparel Info
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Slug {product && "(leave blank to keep)"}
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="premium-tee"
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Variant
            </label>
            <input
              type="text"
              value={form.variant}
              onChange={(e) => update("variant", e.target.value)}
              placeholder="t-shirt, hoodie, cap"
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Price (₹) *
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Stock
            </label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Image URLs * (one per line)
            </label>
            <textarea
              value={form.images}
              onChange={(e) => update("images", e.target.value)}
              required
              rows={3}
              placeholder="https://picsum.photos/600/600"
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          {isSubmitting ? "Saving…" : product ? "Update Product" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
