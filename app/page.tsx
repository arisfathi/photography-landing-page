"use client";

import { useEffect, useState } from "react";
import type { PackageCategory } from "@/lib/types"; // slug string
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CalendarSection from "@/components/CalendarSection";
import PortfolioSection from "@/components/PortfolioSection";
import PackagesSection from "@/components/PackagesSection";
import InquirySection from "@/components/InquirySection";
import type { SiteSettings } from "@/lib/getSettings";
import { getSiteSettings } from "@/lib/getSettings";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] =
    useState<PackageCategory>("convocation");

  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    (async () => {
      const fetched = await getSiteSettings();
      setSettings(fetched);
    })();
  }, []);

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
        onCategoryChange={setSelectedCategory}
      />

      <PackagesSection 
        selectedCategory={selectedCategory} 
        settings={settings} 
      />

      <CalendarSection
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
      
      <InquirySection
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        settings={settings}
      />

      <footer className="bg-slate-900 text-slate-300 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p>&copy; 2026 raygraphy. All rights reserved.</p>
          <p className="mt-2">Professional Photography Services</p>
        </div>
      </footer>
    </main>
  );
}
