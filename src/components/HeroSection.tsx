"use client";

import type { SiteSettings } from "@/lib/getSettings";
import Image from "next/image";

type HeroSectionProps = {
  settings: SiteSettings | null;
};

export default function HeroSection({ settings }: HeroSectionProps) {
  const heroTitle = settings?.hero_title || "Professional Photography";
  const heroSubtitle =
    settings?.hero_subtitle || "Capturing moments, creating memories";
  const heroTagline =
    settings?.hero_tagline ||
    "Convocation, wedding, and event photography that tells your unique story.";
  const heroBannerUrl = settings?.hero_banner_url;

  if (heroBannerUrl) {
    // Banner image hero
    return (
      <section className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
        <Image
          src={heroBannerUrl}
          alt="Hero banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            {heroTitle}
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-2 sm:mb-3">
            {heroSubtitle}
          </p>
          <p className="text-sm sm:text-base max-w-2xl text-slate-100">
            {heroTagline}
          </p>
        </div>
      </section>
    );
  }

  // Gradient hero (fallback)
  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 sm:py-20 md:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
          {heroTitle}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-3 sm:mb-4">
          {heroSubtitle}
        </p>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          {heroTagline}
        </p>
      </div>
    </section>
  );
}
