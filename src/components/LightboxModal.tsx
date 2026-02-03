"use client";

import { useEffect } from "react";
import Image from "next/image";
import ArrowLeftSIcon from "@remixicons/react/line/ArrowLeftSIcon";
import ArrowRightSIcon from "@remixicons/react/line/ArrowRightSIcon";
import CloseIcon from "@remixicons/react/line/CloseIcon";
import type { GalleryImage } from "@/lib/gallery";

type LightboxModalProps = {
  items: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function LightboxModal({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: LightboxModalProps) {
  const active = index !== null ? items[index] : null;

  useEffect(() => {
    if (index === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, onClose, onNext, onPrev]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
        aria-label="Close"
      >
        <CloseIcon className="h-6 w-6 fill-current" />
      </button>

      <button
        type="button"
        onClick={onPrev}
        className="absolute left-3 sm:left-6 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition"
        aria-label="Previous image"
      >
        <ArrowLeftSIcon className="h-6 w-6 fill-current" />
      </button>

      <div
        className="relative w-full max-w-5xl h-[70vh] sm:h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={active.url}
          alt=""
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      <button
        type="button"
        onClick={onNext}
        className="absolute right-3 sm:right-6 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition"
        aria-label="Next image"
      >
        <ArrowRightSIcon className="h-6 w-6 fill-current" />
      </button>
    </div>
  );
}
