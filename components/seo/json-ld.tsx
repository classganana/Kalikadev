/**
 * JSON-LD structured data for SEO.
 */
import { siteConfig } from "@/lib/seo";

interface OrganizationJsonLdProps {
  url?: string;
}

export function OrganizationJsonLd({ url }: OrganizationJsonLdProps) {
  const baseUrl = url ?? siteConfig.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: baseUrl,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string | string[];
  price: number;
  url: string;
  availability?: "InStock" | "OutOfStock";
  sku?: string;
  brand?: string;
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  url,
  availability = "InStock",
  sku,
  brand = siteConfig.name,
}: ProductJsonLdProps) {
  const images = Array.isArray(image) ? image : [image];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images,
    sku: sku ?? undefined,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price,
      availability: `https://schema.org/${availability}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
