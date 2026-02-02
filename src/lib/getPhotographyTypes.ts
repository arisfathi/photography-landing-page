import { supabase } from "@/lib/supabaseClient";

export type PhotographyType = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

export async function getPhotographyTypes(): Promise<PhotographyType[]> {
  const { data, error } = await supabase
    .from("photography_types")
    .select("id, name, slug, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading photography types:", error);
    return [];
  }

  return (data as PhotographyType[]) ?? [];
}
