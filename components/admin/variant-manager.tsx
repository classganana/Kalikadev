"use client";

/**
 * Variant manager - Add, edit, delete, update stock for apparel variants.
 * Product → Variants table: Size | Color | Stock | Price | Actions
 */
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Variant {
  _id: string;
  productId: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  sku?: string;
  createdAt?: string;
}

interface VariantManagerProps {
  productId: string;
  productName: string;
}

export function VariantManager({ productId, productName }: VariantManagerProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchVariants = useCallback(async () => {
    try {
      const res = await fetch(`/api/variants/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setVariants(data);
      } else {
        setVariants([]);
      }
    } catch {
      setVariants([]);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const size = (form.elements.namedItem("size") as HTMLInputElement)?.value?.trim();
    const color = (form.elements.namedItem("color") as HTMLInputElement)?.value?.trim();
    const price = Number((form.elements.namedItem("price") as HTMLInputElement)?.value || 0);
    const stock = Math.max(0, Number((form.elements.namedItem("stock") as HTMLInputElement)?.value || 0));

    if (!size || !color) {
      setError("Size and color are required");
      return;
    }

    try {
      const res = await fetch("/api/admin/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, size, color, price, stock }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to add variant");
      }
      setShowAddForm(false);
      form.reset();
      await fetchVariants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add variant");
    }
  };

  const handleUpdate = async (
    variantId: string,
    updates: { size?: string; color?: string; price?: number; stock?: number }
  ) => {
    setError("");
    try {
      const res = await fetch(`/api/admin/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update");
      }
      setEditingId(null);
      await fetchVariants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm("Delete this variant? This cannot be undone.")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/variants/${variantId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete");
      }
      await fetchVariants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Variants — {productName}
        </h2>
        <button
          type="button"
          onClick={() => setShowAddForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          Add Variant
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800"
        >
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Size
              </label>
              <input
                name="size"
                type="text"
                required
                placeholder="S, M, L..."
                className="mt-1 w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Color
              </label>
              <input
                name="color"
                type="text"
                required
                placeholder="Black, Red..."
                className="mt-1 w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue="0"
                className="mt-1 w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Price (₹)
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                required
                className="mt-1 w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  No variants yet. Add variants so customers can select size and color.
                </td>
              </tr>
            ) : (
              variants.map((v) =>
                editingId === v._id ? (
                  <VariantEditRow
                    key={v._id}
                    variant={v}
                    onSave={(updates) => handleUpdate(v._id, updates)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <tr
                    key={v._id}
                    className="border-b border-zinc-200 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                      {v.size}
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                      {v.color}
                    </td>
                    <td className="px-6 py-4">
                      <VariantStockInput
                        variantId={v._id}
                        stock={v.stock}
                        onSave={(stock) => handleUpdate(v._id, { stock })}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                      {formatPrice(v.price)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingId(v._id)}
                        className="mr-2 rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                        aria-label="Edit variant"
                      >
                        <Pencil className="size-4" strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v._id)}
                        className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        aria-label="Delete variant"
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VariantStockInput({
  variantId,
  stock,
  onSave,
}: {
  variantId: string;
  stock: number;
  onSave: (stock: number) => void;
}) {
  const [value, setValue] = useState(String(stock));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(String(stock));
  }, [stock]);

  const handleBlur = () => {
    const num = Math.max(0, Number(value) || 0);
    if (num !== stock) {
      setIsSaving(true);
      onSave(num);
      setValue(String(num));
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="number"
      min="0"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
      disabled={isSaving}
    />
  );
}

function VariantEditRow({
  variant,
  onSave,
  onCancel,
}: {
  variant: Variant;
  onSave: (u: { size?: string; color?: string; price?: number; stock?: number }) => void;
  onCancel: () => void;
}) {
  const [size, setSize] = useState(variant.size);
  const [color, setColor] = useState(variant.color);
  const [price, setPrice] = useState(String(variant.price));
  const [stock, setStock] = useState(String(variant.stock));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      size: size.trim(),
      color: color.trim(),
      price: Number(price) || 0,
      stock: Math.max(0, Number(stock) || 0),
    });
  };

  return (
    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <td className="px-6 py-3">
        <input
          type="text"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-20 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
        />
      </td>
      <td className="px-6 py-3">
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-24 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
        />
      </td>
      <td className="px-6 py-3">
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-20 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
        />
      </td>
      <td className="px-6 py-3">
        <input
          type="number"
          min="0"
          step="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
        />
      </td>
      <td className="px-6 py-3 text-right">
        <button
          type="button"
          onClick={handleSubmit}
          className="mr-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </td>
    </tr>
  );
}
