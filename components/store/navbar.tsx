"use client";

/**
 * Store Navbar - Ultra-premium ecommerce navigation.
 * Apple/Tesla/Stripe inspired. Mobile hamburger menu.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { CartIcon } from "./cart-icon";
import { NavbarAuth } from "./navbar-auth";
import { ThemeToggle } from "./theme-toggle";
import { isApparelEnabled } from "@/lib/feature-flags";

const baseNavLinks = [
  { href: "/batteries", label: "Batteries" },
  ...(isApparelEnabled ? [{ href: "/apparel", label: "Apparel" }] as const : []),
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
] as const;

export function StoreNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 bg-white/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70 dark:border-zinc-800/60 dark:bg-zinc-950/90 dark:supports-[backdrop-filter]:bg-zinc-950/70">
      <nav
        className="relative mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="size-5" strokeWidth={1.5} />
          ) : (
            <Menu className="size-5" strokeWidth={1.5} />
          )}
        </button>

        {/* Logo - flex-1 center on mobile, static on desktop */}
        <div className="flex min-w-0 flex-1 justify-center md:flex-none md:justify-start">
          <Link
            href="/"
            className="truncate text-xl font-semibold tracking-[-0.02em] text-zinc-900 transition-opacity duration-200 hover:opacity-70 dark:text-white"
          >
            Kalikadev
          </Link>
        </div>

        {/* Center nav links - desktop only */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex md:items-center md:gap-10">
          {baseNavLinks.map(({ href, label }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
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

        {/* Right: Theme + Cart + Auth */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <CartIcon />
          <NavbarAuth />
        </div>
      </nav>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div
          className="absolute left-0 right-0 top-full border-b border-zinc-200 bg-white/95 backdrop-blur-xl md:hidden dark:border-zinc-800 dark:bg-zinc-950/95"
          role="dialog"
          aria-label="Mobile menu"
        >
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex flex-col gap-1">
              {baseNavLinks.map(({ href, label }) => {
                const isActive =
                  pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
