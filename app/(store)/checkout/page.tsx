/**
 * Checkout page - WhatsApp order flow.
 */
import { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your battery order via WhatsApp.",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
