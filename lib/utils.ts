import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolve image URL for display. When NEXT_PUBLIC_UPLOAD_BASE_URL is set
 * (e.g. for local dev), relative paths like /uploads/xxx are resolved to
 * the production URL so images load from the hosted server.
 */
export function getImageUrl(src: string): string {
  const trimmed = typeof src === "string" ? src.trim() : "";
  if (!trimmed || trimmed.startsWith("http")) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed.replace(/^\//, "")}`;
  const base = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL ?? "";
  return base ? `${base.replace(/\/$/, "")}${path}` : path;
}

/** Format price in Indian Rupees */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}
