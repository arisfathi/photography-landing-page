import { supabase } from "@/lib/supabaseClient";

export type SiteSettings = {
  id: number;
  brand_name: string | null;
  brand_domain: string | null;
  logo_url: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null; // wa.me number without +
  instagram_url: string | null;
  tiktok_url: string | null;
  updated_at: string | null;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("getSiteSettings error:", error.message);
    return null;
  }

  return data as SiteSettings;
}
