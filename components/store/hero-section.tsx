/**
 * Hero Section - Large product showcase with strong typography.
 * Apple/Tesla inspired. Luxury aesthetic with generous whitespace.
 */
import Image from "next/image";
import Link from "next/link";

interface HeroSectionProps {
  /** Headline - large, impactful */
  headline: string;
  /** Subheadline - supporting copy */
  subheadline: string;
  /** CTA button text */
  ctaLabel: string;
  /** CTA destination */
  ctaHref: string;
  /** Secondary link (e.g. "Learn more") */
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Hero image - placeholder battery */
  imageSrc: string;
  imageAlt: string;
}

export function HeroSection({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  imageSrc,
  imageAlt,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-zinc-950">
      {/* Content - large typography, centered */}
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 lg:px-8 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-semibold tracking-[-0.03em] text-zinc-900 sm:text-6xl md:text-7xl dark:text-white">
            {headline}
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-zinc-600 sm:text-2xl dark:text-zinc-400">
            {subheadline}
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href={ctaHref}
              className="inline-flex rounded-full bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all duration-300 hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/15 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:shadow-zinc-950/20 dark:hover:bg-zinc-100"
            >
              {ctaLabel}
            </Link>
            {secondaryLabel && secondaryHref && (
              <Link
                href={secondaryHref}
                className="text-base font-semibold text-zinc-600 transition-colors duration-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                {secondaryLabel} <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </div>

        {/* Large product image - premium showcase */}
        <div className="mx-auto mt-20 max-w-5xl lg:mt-28">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100 shadow-2xl shadow-zinc-900/5 dark:bg-zinc-900 dark:shadow-zinc-950/50">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
