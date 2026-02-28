"use client";

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

const HOME_SERVICE_HASHES = new Set(["portrait", "convocation", "event"]);

function getCategoryFromHash(): PackageCategory | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace("#", "").toLowerCase();
  if (!hash || !HOME_SERVICE_HASHES.has(hash)) return null;
  return hash as PackageCategory;
}

export default function HomePageClient() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] =
    useState<PackageCategory | null>(() => getCategoryFromHash());
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

  useEffect(() => {
    const syncCategoryFromHash = () => {
      const hashCategory = getCategoryFromHash();
      if (!hashCategory) return;
      setSelectedCategory(hashCategory);
      setSelectedPackage(null);
      setSelectedTypeLabel(null);
    };

    window.addEventListener("hashchange", syncCategoryFromHash);
    return () => window.removeEventListener("hashchange", syncCategoryFromHash);
  }, []);

  const handleCategoryChange = (category: PackageCategory | null) => {
    setSelectedCategory(category);
    setSelectedPackage(null);
    setSelectedTypeLabel(null);

    if (!category || typeof window === "undefined") return;

    const targetElement =
      document.getElementById(category) || document.getElementById("packages");

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.history.replaceState(null, "", `/#${category}`);
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

      <div id="portrait" className="scroll-mt-24" aria-hidden="true" />
      <div id="convocation" className="scroll-mt-24" aria-hidden="true" />
      <div id="event" className="scroll-mt-24" aria-hidden="true" />

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
        </div>
      </footer>
    </main>
  );
}
