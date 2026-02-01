"use client";

import { useEffect, useState } from "react";
import type { PackageCategory } from "@/lib/types"; // only for the type if you still use it
import Header from "@/components/Header";
import CalendarSection from "@/components/CalendarSection";
import PortfolioSection from "@/components/PortfolioSection";
import PackagesSection from "@/components/PackagesSection";
import InquirySection from "@/components/InquirySection";
import { CATEGORIES, getCategoryLabel } from "@/lib/categories";


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

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Professional Photography
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-4">
            Capturing moments, creating memories
          </p>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Convocation, wedding, and event photography that tells your unique story.
          </p>
        </div>
      </section>

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
          <p>&copy; 2026 Raygraphy.co All rights reserved.</p>
          <p className="mt-2">Professional Photography Services</p>
        </div>
      </footer>
    </main>
  );
}
