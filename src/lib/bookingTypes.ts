import type { PackageCategory } from "@/lib/types";

export type SelectedPackage = {
  id: string;
  category: PackageCategory;
  name: string;
  price: string;
  description: string;
  features: string[];
};
