"use client";

/**
 * Store Navbar - Ultra-premium ecommerce navigation.
 * Apple/Tesla/Stripe inspired.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIcon } from "./cart-icon";
import { NavbarAuth } from "./navbar-auth";
import { isApparelEnabled } from "@/lib/feature-flags";

const baseNavLinks = [
  { href: "/batteries", label: "Batteries" },
  ...(isApparelEnabled ? [{ href: "/apparel", label: "Apparel" }] as const : []),
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
] as const;

export function StoreNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 bg-white/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70 dark:border-zinc-800/60 dark:bg-zinc-950/90 dark:supports-[backdrop-filter]:bg-zinc-950/70">
      <nav
        className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-[-0.02em] text-zinc-900 transition-opacity duration-200 hover:opacity-70 dark:text-white"
        >
          Kalikadev
        </Link>

        {/* Center nav links */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex md:items-center md:gap-10">
          {baseNavLinks.map(({ href, label }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                className={`text-[15px] font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right: Cart + Auth */}
        <div className="flex items-center gap-1">
          <CartIcon />
          <NavbarAuth />
        </div>
      </nav>
    </header>
  );
}
