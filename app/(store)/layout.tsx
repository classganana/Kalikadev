/**
 * Store layout - wraps all customer-facing pages.
 * Includes navbar and footer. Server component for optimal performance.
 */
import { StoreFooter } from "@/components/store/footer";
import { StoreNavbar } from "@/components/store/navbar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreNavbar />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}
