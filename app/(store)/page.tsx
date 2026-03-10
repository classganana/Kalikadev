/**
 * Home page - Ultra-premium landing with hero showcase.
 * Server component.
 */
import { HeroSection } from "@/components/store/hero-section";

export default function HomePage() {
  return (
    <HeroSection
      headline="Power reimagined."
      subheadline="Premium lithium batteries built for performance and longevity. Engineered for the future."
      ctaLabel="Explore Batteries"
      ctaHref="/batteries"
      secondaryLabel="Learn more"
      secondaryHref="/about"
      imageSrc="https://picsum.photos/seed/hero-battery/1600/1000"
      imageAlt="Premium lithium battery showcase"
    />
  );
}
