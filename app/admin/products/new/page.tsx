"use client";

/**
 * Add new product - unified form with product type selector.
 */
import { useState } from "react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { ApparelForm } from "@/components/admin/apparel-form";

export default function NewProductPage() {
  const [productType, setProductType] = useState<"battery" | "apparel">("battery");

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-6 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        ← Back to products
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Add Product
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Create a new product. Select the product type below.
      </p>

      <div className="mt-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Product Type
        </label>
        <div className="mt-2 flex gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="productType"
              value="battery"
              checked={productType === "battery"}
              onChange={() => setProductType("battery")}
              className="size-4"
            />
            <span>Battery</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="productType"
              value="apparel"
              checked={productType === "apparel"}
              onChange={() => setProductType("apparel")}
              className="size-4"
            />
            <span>Apparel</span>
          </label>
        </div>
      </div>

      <div className="mt-8">
        {productType === "battery" ? (
          <ProductForm />
        ) : (
          <ApparelForm />
        )}
      </div>
    </div>
  );
}
