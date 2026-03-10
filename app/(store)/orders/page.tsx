"use client";

/**
 * My Orders page - customer's order history.
 */
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OrderRow {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  orderStatus: string;
  deliveryPartner: string;
  trackingId?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/orders")}`);
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/orders/mine")
      .then((res) => {
        if (res.status === 401) {
          router.replace(`/login?callbackUrl=${encodeURIComponent("/orders")}`);
          return [];
        }
        return res.ok ? res.json() : [];
      })
      .then(setOrders)
      .finally(() => setIsLoading(false));
  }, [status, router]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusColors: Record<string, string> = {
    CREATED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    CONTACTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    CONFIRMED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    PROCESSING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-pulse rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        My Orders
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        View and track your orders
      </p>

      {orders.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No orders yet.</p>
          <Link
            href="/batteries"
            className="mt-4 inline-block font-medium text-zinc-900 hover:underline dark:text-white"
          >
            Browse batteries →
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Delivery
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-zinc-200 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusColors[order.orderStatus] ?? statusColors.CREATED
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {order.deliveryPartner}
                    {order.trackingId && (
                      <span className="block text-xs">
                        {order.trackingId}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/orders/${order._id}`}
                      className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
