import type { PackageCategory } from "@/lib/types";

export const CATEGORIES: PackageCategory[] = ["convocation", "wedding", "event"];

export const CATEGORY_LABEL: Record<PackageCategory, string> = {
  convocation: "Convocation",
  wedding: "Wedding",
  event: "Event",
};

export const getCategoryLabel = (cat: PackageCategory) => CATEGORY_LABEL[cat];
