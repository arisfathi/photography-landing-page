"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PackageCategory } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getPhotographyTypes } from "@/lib/getPhotographyTypes";
import type { PhotographyType } from "@/lib/getPhotographyTypes";


type PortfolioPhotoRow = {
  id: string;
  category: PackageCategory;      // "convocation" | "wedding" | "event"
  title: string | null;
  alt: string | null;
  image_url: string;              // public URL (from storage)
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
};

interface PortfolioSectionProps {
  selectedCategory: PackageCategory;
  onCategoryChange: (category: PackageCategory) => void;
}

export default function PortfolioSection({
  selectedCategory,
  onCategoryChange,
}: PortfolioSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<PackageCategory[]>([]);
  const [types, setTypes] = useState<PhotographyType[]>([]);

  const [images, setImages] = useState<
    { id: string; src: string; alt: string; title: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load photography types from DB
  useEffect(() => {
    const loadTypes = async () => {
      const list = await getPhotographyTypes();
      setTypes(list);
      if (list.length > 0) {
        const slugs = list.map((t) => t.slug as PackageCategory);
        setCategories(slugs);
        if (!slugs.includes(selectedCategory) && slugs.length > 0) {
          onCategoryChange(slugs[0]);
        }
      } else {
        setCategories([selectedCategory]);
      }
    };

    loadTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchPortfolio = async () => {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("portfolio_photos")
      .select("*")
      .eq("category", selectedCategory)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setErr(error.message);
      setImages([]);
      setLoading(false);
      return;
    }

    const rows = (data as PortfolioPhotoRow[]) ?? [];

    // map to your original UI shape: image.src / image.alt / image.title
    setImages(
      rows.map((r) => ({
        id: r.id,
        src: r.image_url,
        alt: r.alt || r.title || "Portfolio photo",
        title: r.title || "",
      }))
    );

    setLoading(false);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const getTypeLabel = (slug: string): string => {
    const type = types.find((t) => t.slug === slug);
    if (type) return type.name;
    // Fallback to slug
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  };

  return (
    <section id="portfolio" className="py-12 px-4 bg-white">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
          Portfolio
        </h2>

        {/* Category Buttons (same UI) */}
        <div className="mb-8">
          <div className="mx-auto w-full max-w-2xl">
            <div className="grid w-full grid-cols-3 gap-3 rounded-xl bg-slate-100 p-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`
                    w-full rounded-lg py-2 text-sm font-semibold transition
                    ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white shadow"
                        : "bg-transparent text-slate-600 hover:bg-slate-200"
                    }
                  `}
                >
                  {getTypeLabel(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {err && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 font-medium text-left">
            {err}
          </div>
        )}

        {/* Carousel (same UI) */}
        <div className="relative">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-slate-50 transition lg:flex hidden items-center justify-center"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} className="text-slate-900" />
          </button>

          {/* Image Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ scrollBehavior: "smooth" }}
          >
            {loading ? (
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-700 font-medium text-left">
                Loading...
              </div>
            ) : images.length === 0 ? (
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-700 font-medium text-left">
                No photos in this category yet.
              </div>
            ) : (
              images.map((image) => (
                <div
                  key={image.id}
                  className="flex-shrink-0 w-80 h-64 relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition snap-start"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover hover:scale-105 transition duration-300"
                    sizes="320px"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex items-end justify-start p-4">
                    <div className="text-white">
                      <p className="font-semibold text-sm">{image.title}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-slate-50 transition lg:flex hidden items-center justify-center"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} className="text-slate-900" />
          </button>
        </div>

        {/* Mobile Swipe Hint */}
        <p className="text-center text-slate-500 text-sm mt-4 lg:hidden">
          Swipe to see more
        </p>
      </div>
    </section>
  );
}
