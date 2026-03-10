"use client";

/**
 * Checkout form - Name, phone, address. Submits to WhatsApp.
 */
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import {
  buildWhatsAppMessage,
  getWhatsAppRedirectUrl,
  type CustomerDetails,
} from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";

export function CheckoutForm() {
  const { items } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CustomerDetails>({
    name: "",
    phone: "",
    address: "",
    companyName: "",
    gst: "",
  });
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({});

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const formattedSubtotal = formatPrice(subtotal);

  const validate = (): boolean => {
    const e: Partial<CustomerDetails> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.companyName?.trim()) e.companyName = "Company name is required";
    if (!form.gst?.trim()) e.gst = "GSTIN is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        productName: i.name,
        quantity: i.quantity,
        price: i.price,
        voltage: i.voltage,
        capacity: i.capacity,
        variantId: i.variantId ?? undefined,
        size: i.size,
        color: i.color,
      }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          customerAddress: form.address,
          customerCompany: form.companyName,
          customerGst: form.gst,
          items: orderItems,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create order");
      }
      const order = await res.json();

      // Skip WhatsApp redirect when NEXT_PUBLIC_WHATSAPP_DISABLED=true (for dev/testing)
      if (process.env.NEXT_PUBLIC_WHATSAPP_DISABLED !== "true") {
        const message = buildWhatsAppMessage(
          order.orderId,
          items.map((i) => ({
            name: i.name,
            voltage: i.voltage,
            capacity: i.capacity,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          form
        );
        const url = getWhatsAppRedirectUrl(message);
        window.location.href = url;
      } else {
        window.location.href = "/checkout/success";
      }
    } catch (err) {
      setErrors({ name: err instanceof Error ? err.message : "Something went wrong" });
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Checkout
        </h1>
        <p className="mt-6 text-zinc-600 dark:text-zinc-400">
          Your cart is empty.{" "}
          <Link
            href="/batteries"
            className="font-semibold text-zinc-900 underline-offset-4 hover:underline dark:text-white"
          >
            Add batteries
          </Link>{" "}
          to proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Checkout
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        You'll be redirected to WhatsApp to complete your order.
      </p>

      <form onSubmit={handleSubmit} className="mt-12 grid gap-12 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Contact Details
            </h2>
            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white"
                  placeholder="Your full name"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white"
                  placeholder="+1 234 567 8900"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white"
                  placeholder="Full delivery address"
                  autoComplete="street-address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.address}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={form.companyName ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white"
                  placeholder="Your company name"
                  autoComplete="organization"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.companyName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="gst"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  GSTIN
                </label>
                <input
                  id="gst"
                  type="text"
                  value={form.gst ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, gst: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-white"
                  placeholder="e.g. 27AABCU9603R1ZM"
                />
                {errors.gst && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.gst}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Order Summary
            </h2>
            <ul className="mt-4 space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.productId}:${item.variantId ?? "base"}`}
                  className="flex gap-4"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
                    <Image
                      src={item.image || "https://picsum.photos/56/56"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Qty {item.quantity} × {formatPrice(item.price)}
                      {(item.size || item.color) && (
                        <> · {[item.size, item.color].filter(Boolean).join(" ")}</>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-700">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {formattedSubtotal}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                "Opening WhatsApp…"
              ) : (
                <>
                  <svg
                    className="size-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Continue to WhatsApp
                </>
              )}
            </button>
            <Link
              href="/cart"
              className="mt-4 block text-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              ← Back to cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
