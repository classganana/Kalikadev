/**
 * Dynamic sitemap - Served at /sitemap.xml
 */
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import { isApparelEnabled } from "@/lib/feature-flags";

const baseUrl = siteConfig.url;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/batteries`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/cart`, lastModified: new Date(), changeFrequency: "always", priority: 0.3 },
  ];

  if (isApparelEnabled) {
    staticPages.push({
      url: `${baseUrl}/apparel`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  let productPages: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const products = await Product.find({
      category: { $in: ["battery", ...(isApparelEnabled ? ["apparel"] : [])] },
    })
      .select("slug category")
      .lean();

    productPages = products.map((p) => ({
      url: `${baseUrl}/${p.category === "battery" ? "batteries" : "apparel"}/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable at build/request time - return static only
  }

  return [...staticPages, ...productPages];
}
