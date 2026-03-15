"use client";

/**
 * Product form - Add and edit battery products.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "./image-upload-field";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  variant: string;
  images: string;
  stock: string;
  voltage: string;
  capacity: string;
  batteryType: string;
  warranty: string;
  connectorType: string;
}

interface ProductFormProps {
  product?: {
    name: string;
    slug: string;
    description: string;
    price: number;
    variant: string;
    images: string[];
    stock: number;
    specification?: {
      voltage: number;
      capacity: number;
      batteryType: string;
      warranty: string;
      connectorType: string;
    };
  };
}

const defaultForm: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  variant: "lithium",
  images: "",
  stock: "0",
  voltage: "",
  capacity: "",
  batteryType: "LiFePO4",
  warranty: "",
  connectorType: "",
};

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(
    product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: String(product.price),
          variant: product.variant ?? (product as { productType?: string }).productType ?? "lithium",
          images: product.images.join("\n"),
          stock: String(product.stock ?? 0),
          voltage: String(product.specification?.voltage ?? ""),
          capacity: String(product.specification?.capacity ?? ""),
          batteryType: product.specification?.batteryType ?? "LiFePO4",
          warranty: product.specification?.warranty ?? "",
          connectorType: product.specification?.connectorType ?? "",
        }
      : defaultForm
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key: keyof ProductFormData, value: string) =>
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
      setError("At least one image is required (upload or paste URL)");
      setIsSubmitting(false);
      return;
    }

    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim(),
        price: Number(form.price),
        productType: "battery",
        variant: form.variant.trim(),
        images,
        stock: Number(form.stock) || 0,
        voltage: Number(form.voltage),
        capacity: Number(form.capacity),
        batteryType: form.batteryType.trim(),
        warranty: form.warranty.trim(),
        connectorType: form.connectorType.trim(),
      };

      if (product) {
        const res = await fetch(`/api/admin/products/${product.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to update");
        }
        router.push("/admin/products");
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to create");
        }
        router.push("/admin/products");
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
          Basic Info
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
              placeholder="power-cell-pro"
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
            <ImageUploadField
              value={form.images}
              onChange={(v) => update("images", v)}
              label="Product Images *"
              hint="Upload battery images or paste URLs (one per line)"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Battery Specification
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Voltage (V) *
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.voltage}
              onChange={(e) => update("voltage", e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Capacity (Ah) *
            </label>
            <input
              type="number"
              min="0"
              value={form.capacity}
              onChange={(e) => update("capacity", e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Battery Type *
            </label>
            <input
              type="text"
              value={form.batteryType}
              onChange={(e) => update("batteryType", e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Warranty *
            </label>
            <input
              type="text"
              value={form.warranty}
              onChange={(e) => update("warranty", e.target.value)}
              required
              placeholder="10 years"
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Connector Type *
            </label>
            <input
              type="text"
              value={form.connectorType}
              onChange={(e) => update("connectorType", e.target.value)}
              required
              placeholder="MC4"
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
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
