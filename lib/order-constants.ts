/**
 * Order status and delivery partner constants.
 * Safe to import from client components (no mongoose/server deps).
 */
export const ORDER_STATUS = [
  "CREATED",
  "CONTACTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const DELIVERY_PARTNER = [
  "NONE",
  "BLUEDART",
  "DELHIVERY",
  "SHIPROCKET",
  "PICKRR",
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];
export type DeliveryPartner = (typeof DELIVERY_PARTNER)[number];
