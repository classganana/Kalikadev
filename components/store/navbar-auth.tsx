"use client";

/**
 * Navbar auth section - Login/Signup when logged out, user menu when logged in.
 */
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { ChevronDown, Package, LogOut } from "lucide-react";

export function NavbarAuth() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="ml-2 h-9 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  if (!session?.user) {
    return (
      <div className="ml-2 flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Signup
        </Link>
        <Link
          href="/admin/login"
          className="rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 transition-colors duration-200 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
        >
          Admin
        </Link>
      </div>
    );
  }

  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
  const userName = session.user.name ?? session.user.email ?? "Account";

  return (
    <div className="relative ml-2" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:border-zinc-600"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="truncate max-w-[120px]">{userName}</span>
        <ChevronDown className="size-4 shrink-0 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : undefined }} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <Link
            href="/orders"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={() => setOpen(false)}
          >
            <Package className="size-4" />
            My Orders
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: window.location.origin });
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
