/**
 * WhatsApp checkout message generator.
 * Admin number from NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER (e.g. 919876543210).
 */
export interface OrderItem {
  name: string;
  voltage?: number;
  capacity?: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  companyName: string;
  gst: string;
}

export function buildWhatsAppMessage(
  orderId: string,
  items: OrderItem[],
  customer: CustomerDetails
): string {
  const productLines = items
    .map((item) => {
      const parts = [
        `Product: ${item.name}`,
        item.voltage != null ? `Voltage: ${item.voltage}V` : null,
        item.capacity != null ? `Capacity: ${item.capacity}Ah` : null,
        (item.size || item.color) ? `Variant: ${[item.size, item.color].filter(Boolean).join(" · ")}` : null,
        `Quantity: ${item.quantity}`,
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n\n");

  return `Hello, I want to order the following items.

Order ID: ${orderId}

${productLines}

Customer Details:
Name: ${customer.name}
Phone: ${customer.phone}
Address: ${customer.address}
Company: ${customer.companyName}
GST: ${customer.gst}`;
}

export function getWhatsAppRedirectUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER;
  if (!number) {
    throw new Error("NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER is not configured");
  }
  const cleanNumber = number.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}
