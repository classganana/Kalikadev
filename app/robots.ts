/**
 * robots.txt - Served at /robots.txt
 */
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/checkout", "/orders"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
