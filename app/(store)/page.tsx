/**
 * Home page - KD Lithium Batteries landing.
 * Server component.
 */
import { HeroSection } from "@/components/store/hero-section";

export default function HomePage() {
  return (
    <HeroSection
      headline="KD Lithium Batteries"
      subheadline="High-performance LiFePO4 batteries for solar, EVs, and energy storage. Built for reliability, backed by years of warranty."
      ctaLabel="Explore Batteries"
      ctaHref="/batteries"
      secondaryLabel="About KD Lithium"
      secondaryHref="/about"
      imageSrc="https://images.pexels.com/photos/34800678/pexels-photo-34800678.jpeg?auto=compress&cs=tinysrgb&w=1600&fit=max"
      imageAlt="KD Lithium battery - premium energy storage"
    />
  );
}
