"use client";

import Image from "next/image";
import type { GalleryImage } from "@/lib/gallery";

type GalleryGridProps = {
  items: GalleryImage[];
  loading?: boolean;
  onSelect?: (index: number) => void;
};

const skeletonItems = Array.from({ length: 12 }, (_, i) => i);

export default function GalleryGrid({ items, loading = false, onSelect }: GalleryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {skeletonItems.map((i) => (
          <div
            key={i}
            className="aspect-[4/5] w-full rounded-xl bg-slate-200/70 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((img, index) => (
        <button
          key={img.id}
          type="button"
          onClick={() => onSelect?.(index)}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-slate-100"
          aria-label="Open image"
        >
          <Image
            src={img.url}
            alt=""
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
          />
        </button>
      ))}
    </div>
  );
}
