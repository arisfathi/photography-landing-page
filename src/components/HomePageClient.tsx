"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PackageCategory } from "@/lib/types";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CalendarSection from "@/components/CalendarSection";
import PortfolioSection from "@/components/PortfolioSection";
import PackagesSection from "@/components/PackagesSection";
import InquirySection from "@/components/InquirySection";
import type { SiteSettings } from "@/lib/getSettings";
import { getSiteSettings } from "@/lib/getSettings";
import type { SelectedPackage } from "@/lib/bookingTypes";

export default function HomePageClient() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] =
    useState<PackageCategory | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage | null>(null);
  const [selectedTypeLabel, setSelectedTypeLabel] = useState<string | null>(null);

  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    (async () => {
      const fetched = await getSiteSettings();
      setSettings(fetched);
    })();
  }, []);

  useEffect(() => {
    const scrollToHash = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      if (!hash) return;
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  const handleCategoryChange = (category: PackageCategory | null) => {
    setSelectedCategory(category);
    setSelectedPackage(null);
    setSelectedTypeLabel(null);
  };

  const handleDateSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  return (
    <main className="min-h-screen bg-white">
      <Header settings={settings} />

      <HeroSection settings={settings} />

      <PortfolioSection
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <PackagesSection
        selectedCategory={selectedCategory}
        settings={settings}
        onSelectPackage={({ categoryLabel, pkg }) => {
          setSelectedTypeLabel(categoryLabel);
          setSelectedPackage(pkg);
        }}
      />

      <CalendarSection
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedPackage={selectedPackage}
        selectedTypeLabel={selectedTypeLabel}
        settings={settings}
      />

      <InquirySection settings={settings} />

      <footer className="bg-slate-900 text-slate-300 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p>&copy; 2026 Raygraphy. All rights reserved.</p>
          <p className="mt-2">Professional Photography Services in KL & Selangor</p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm">
            <Link className="hover:text-white transition" href="/services/portrait">
              Portrait Photography
            </Link>
            <Link className="hover:text-white transition" href="/services/convocation">
              Convocation Photography
            </Link>
            <Link className="hover:text-white transition" href="/services/event">
              Event Photography
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
