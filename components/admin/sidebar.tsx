"use client";

/**
 * Admin sidebar navigation.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Package, Plus, ShoppingBag, Shirt, LogOut, ExternalLink } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Batteries", icon: Package },
  { href: "/admin/products/new", label: "Add Product", icon: Plus },
  { href: "/admin/apparel", label: "Apparel", icon: Shirt },
  { href: "/admin/apparel/new", label: "Add Apparel", icon: Shirt },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link
          href="/admin"
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white"
        >
          KD Lithium Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
              }`}
            >
              <Icon className="size-4" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          <ExternalLink className="size-4" strokeWidth={1.5} />
          View Store
        </Link>
        <button
          type="button"
          onClick={() => {
            const base =
              (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) ||
              (typeof window !== "undefined" ? window.location.origin : "");
            signOut({ callbackUrl: `${base}/admin/login` });
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
        >
          <LogOut className="size-4" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
