/**
 * SEO metadata configuration.
 * Centralized for consistency across the application.
 * Extend per-route as needed via generateMetadata or static export.
 */
import type { Metadata } from "next";

export const siteConfig = {
  name: "Kalikadev",
  description:
    "Premium lithium batteries for performance and longevity. Engineered for a sustainable future.",
  url: process.env.NEXTAUTH_URL ?? "https://kalikadev.com",
  ogImage: "/og-image.png",
  twitterHandle: "@kalikadev",
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Premium Lithium Batteries`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "lithium battery",
    "premium battery",
    "sustainable energy",
    "high performance",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};
