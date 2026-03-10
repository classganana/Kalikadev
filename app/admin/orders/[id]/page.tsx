"use client";

/**
 * Admin order detail - View and update order.
 */
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS, DELIVERY_PARTNER } from "@/lib/order-constants";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  specifications?: {
    voltage?: number;
    capacity?: number;
    size?: string;
    color?: string;
  };
}

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCompany?: string;
  customerGst?: string;
  items: OrderItem[];
  orderStatus: string;
  deliveryPartner: string;
  trackingId?: string;
  createdAt: string;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setOrder)
      .finally(() => setIsLoading(false));
  }, [id]);

  const [status, setStatus] = useState("");
  const [partner, setPartner] = useState("");
  const [tracking, setTracking] = useState("");

  useEffect(() => {
    if (order) {
      setStatus(order.orderStatus);
      setPartner(order.deliveryPartner);
      setTracking(order.trackingId ?? "");
    }
  }, [order]);

  const handleSave = async () => {
    if (!order) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: status,
          deliveryPartner: partner,
          trackingId: tracking || undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !order) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
      </div>
    );
  }

  const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-6 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        ← Back to orders
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Order {order.orderId}
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Customer & products */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Customer Details
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Name</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Phone</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">{order.customerPhone}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Address</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">{order.customerAddress}</dd>
              </div>
              {order.customerCompany && (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Company</dt>
                  <dd className="font-medium text-zinc-900 dark:text-white">{order.customerCompany}</dd>
                </div>
              )}
              {order.customerGst && (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">GST</dt>
                  <dd className="font-medium text-zinc-900 dark:text-white">{order.customerGst}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Products
            </h2>
            <ul className="mt-4 space-y-4">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between border-b border-zinc-200 pb-4 last:border-0 last:pb-0 dark:border-zinc-800">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {item.productName}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Qty {item.quantity} × {formatPrice(item.price)}
                      {item.specifications?.voltage != null && (
                        <> · {item.specifications.voltage}V {item.specifications.capacity ?? ""}Ah</>
                      )}
                      {(item.specifications?.size || item.specifications?.color) && (
                        <> · {[item.specifications.size, item.specifications.color].filter(Boolean).join(" · ")}</>
                      )}
                    </p>
                  </div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 font-semibold dark:border-zinc-800">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Status controls */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Update Order
          </h2>
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
              >
                {(ORDER_STATUS as readonly string[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Delivery Partner
              </label>
              <select
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
              >
                {(DELIVERY_PARTNER as readonly string[]).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tracking ID
              </label>
              <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Enter tracking number"
                className="mt-1.5 w-full rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
