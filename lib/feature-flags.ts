/**
 * Feature flags - read from environment.
 * NEXT_PUBLIC_* vars are available on client and server.
 */
export const isApparelEnabled =
  process.env.NEXT_PUBLIC_ENABLE_APPAREL === "true";
