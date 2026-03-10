"use client";

/**
 * Customer order detail - read-only view.
 */
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(`/orders/${id}`)}`);
      return;
    }
    if (status !== "authenticated") return;

    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/orders");
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then(setOrder)
      .finally(() => setIsLoading(false));
  }, [id, status, router]);

  if (status === "loading" || (status === "authenticated" && (isLoading || !order))) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-pulse rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
        </div>
      </div>
    );
  }

  const total = order!.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <Link
        href="/orders"
        className="mb-6 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        ← Back to orders
      </Link>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Order {order!.orderId}
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {new Date(order!.createdAt).toLocaleString()}
      </p>
      <p className="mt-2">
        <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {order!.orderStatus}
        </span>
        {order!.trackingId && (
          <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
            Tracking: {order!.trackingId}
          </span>
        )}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Delivery Details
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Name</dt>
              <dd className="font-medium text-zinc-900 dark:text-white">{order!.customerName}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Phone</dt>
              <dd className="font-medium text-zinc-900 dark:text-white">{order!.customerPhone}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Address</dt>
              <dd className="font-medium text-zinc-900 dark:text-white">{order!.customerAddress}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Products
          </h2>
          <ul className="mt-4 space-y-4">
            {order!.items.map((item, i) => (
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
    </div>
  );
}
