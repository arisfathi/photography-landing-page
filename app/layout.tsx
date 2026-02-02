import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@supabase/supabase-js";
import DynamicFavicon from "@/components/DynamicFavicon";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

async function getLogoSettings() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { logo_url: null, favicon_url: null, updated_at: null };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  return {
    logo_url: data?.logo_url ?? null,
    favicon_url: data?.favicon_url ?? null,
    updated_at: data?.updated_at ?? null,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { logo_url, favicon_url, updated_at } = await getLogoSettings();
  const fallbackIcon = "/favicon.ico";
  const version = updated_at ? new Date(updated_at).getTime() : Date.now();
  const base = favicon_url ?? logo_url ?? fallbackIcon;
  const iconUrl = `${base}${base.includes("?") ? "&" : "?"}v=${version}`;

  return {
    title: "raygraphy",
    description: "Raygraphy Photography",
    icons: {
      icon: [{ url: iconUrl }],
      apple: [{ url: iconUrl }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { logo_url, favicon_url, updated_at } = await getLogoSettings();
  const base = favicon_url ?? logo_url ?? "/favicon.ico";
  const version = updated_at ? new Date(updated_at).getTime() : Date.now();
  const faviconHref = `${base}${base.includes("?") ? "&" : "?"}v=${version}`;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DynamicFavicon href={faviconHref} />
        {children}
      </body>
    </html>
  );
}
