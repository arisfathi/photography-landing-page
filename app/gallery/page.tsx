import { Suspense } from "react";
import GalleryClient from "./GalleryClient";

export default function GalleryPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-white px-4 py-10" />}
    >
      <GalleryClient />
    </Suspense>
  );
}
