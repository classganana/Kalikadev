"use client";

/**
 * Edit / Delete actions for product row.
 */
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface ProductsListActionsProps {
  slug: string;
}

export function ProductsListActions({ slug }: ProductsListActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete product");
      }
    } catch {
      alert("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/products/${slug}/edit`}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
      >
        <Pencil className="size-4" strokeWidth={1.5} />
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50"
      >
        <Trash2 className="size-4" strokeWidth={1.5} />
        {isDeleting ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
