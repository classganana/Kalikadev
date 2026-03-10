/**
 * Auth utilities for cart and protected routes.
 * Uses NextAuth getServerSession. Session is null for guests.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getSession() {
  return getServerSession(authOptions);
}
