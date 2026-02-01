import type { PackageCategory } from "@/lib/types";

// Deprecated: use getPhotographyTypes() for dynamic categories.
export const CATEGORIES: PackageCategory[] = ["convocation", "wedding", "event"];

// Deprecated: use getPhotographyTypes() to resolve labels from slugs.
export const CATEGORY_LABEL: Record<PackageCategory, string> = {
  convocation: "Convocation",
  wedding: "Wedding",
  event: "Event",
};

// Deprecated: use getPhotographyTypes() to resolve labels from slugs.
export const getCategoryLabel = (cat: PackageCategory) => CATEGORY_LABEL[cat];
