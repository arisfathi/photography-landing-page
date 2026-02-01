"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getPhotographyTypes } from "@/lib/getPhotographyTypes";
import type { PhotographyType } from "@/lib/getPhotographyTypes";
import type { GalleryImage } from "@/lib/gallery";
import GalleryGrid from "@/components/GalleryGrid";
import LightboxModal from "@/components/LightboxModal";
import ArrowLeftSIcon from "@remixicons/react/line/ArrowLeftSIcon";
import Link from "next/link";
import Header from "@/components/Header";
import { getSiteSettings } from "@/lib/getSettings";
import type { SiteSettings } from "@/lib/getSettings";

const formatLabel = (slug: string) =>
  slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

export default function GalleryClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [types, setTypes] = useState<PhotographyType[]>([]);
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const selectedCategory = searchParams.get("category") || "all";

  useEffect(() => {
    (async () => {
      const list = await getPhotographyTypes();
      setTypes(list);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const fetched = await getSiteSettings();
      setSettings(fetched);
    })();
  }, []);

  const categories = useMemo(() => {
    const fromDb = types.map((t) => ({ slug: t.slug, label: t.name }));
    if (fromDb.length > 0) return fromDb;
    return [
      { slug: "convocation", label: "Convocation" },
      { slug: "event", label: "Event" },
      { slug: "pasar-seni", label: "Pasar Seni" },
    ];
  }, [types]);

  const validCategory = useMemo(() => {
    if (selectedCategory === "all") return "all";
    return categories.some((c) => c.slug === selectedCategory) ? selectedCategory : "all";
  }, [categories, selectedCategory]);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (validCategory !== "all") {
        query = query.eq("category", validCategory);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        setItems([]);
        setLoading(false);
        return;
      }

      setItems((data as GalleryImage[]) ?? []);
      setLoading(false);
    };

    fetchGallery();
  }, [validCategory]);

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const onPrev = () => {
    if (items.length === 0 || lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + items.length) % items.length));
  };

  const onNext = () => {
    if (items.length === 0 || lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % items.length));
  };

  return (
    <main className="min-h-screen bg-white">
      <Header settings={settings} />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
          >
            <ArrowLeftSIcon className="h-4 w-4 fill-current" />
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
            Explore Our Work
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Browse by category or view everything in one place.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              validCategory === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                validCategory === cat.slug
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat.label || formatLabel(cat.slug)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 font-medium">
            {error}
          </div>
        )}

        <div className="mt-8">
          <GalleryGrid
            items={items}
            loading={loading}
            onSelect={(index) => setLightboxIndex(index)}
          />
        </div>
      </div>

      <LightboxModal
        items={items}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onPrev={onPrev}
        onNext={onNext}
      />
    </main>
  );
}
