import { Suspense } from "react";
import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Photography Gallery in Kuala Lumpur & Selangor | Raygraphy",
  description:
    "Browse portrait, convocation, and event photography by Raygraphy in Kuala Lumpur and Selangor. Lihat galeri fotografi kami.",
  path: "/gallery",
  keywords: [
    "photography gallery Kuala Lumpur",
    "portfolio photographer Selangor",
    "galeri fotografi KL",
  ],
});

export default function GalleryPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-white px-4 py-10" />}
    >
      <GalleryClient />
    </Suspense>
  );
}
