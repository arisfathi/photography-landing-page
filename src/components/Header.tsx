"use client";

import Link from "next/link";
import { Instagram, Music, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/getSettings";
import Image from "next/image";


type HeaderProps = {
  settings: SiteSettings | null;
};

export default function Header({ settings }: HeaderProps) {
  const brand = settings?.brand_name || "Raygraphy";
  const brandDomain = settings?.brand_domain || "raygraphy.co";
  const phone = settings?.contact_phone || "";
  const instagram = settings?.instagram_url || "";
  const tiktok = settings?.tiktok_url || "";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
            <Image src="/logo.svg" alt="Raygraphy logo" width={256} height={256} />
          </div>
          </div>
          <span className="text-xl font-bold text-slate-900">
            {brandDomain || brand}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-slate-600 text-sm font-medium">
          <Link href="#calendar" className="hover:text-slate-900 transition">
            Calendar
          </Link>
          <Link href="#portfolio" className="hover:text-slate-900 transition">
            Portfolio
          </Link>
          <Link href="#packages" className="hover:text-slate-900 transition">
            Packages
          </Link>
          <Link href="#inquiry" className="hover:text-slate-900 transition">
            Inquiry
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Phone */}
          <a
            href={phone ? `tel:${phone}` : "#inquiry"}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Call"
            title={phone ? phone : "Set phone in admin/settings"}
          >
            <Phone size={20} className="text-slate-600" />
          </a>

          {/* Instagram */}
          <a
            href={instagram || "#inquiry"}
            target={instagram ? "_blank" : undefined}
            rel={instagram ? "noopener noreferrer" : undefined}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Instagram"
            title={instagram ? "Instagram" : "Set Instagram in admin/settings"}
          >
            <Instagram size={20} className="text-slate-600" />
          </a>

          {/* TikTok */}
          <a
            href={tiktok || "#inquiry"}
            target={tiktok ? "_blank" : undefined}
            rel={tiktok ? "noopener noreferrer" : undefined}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="TikTok"
            title={tiktok ? "TikTok" : "Set TikTok in admin/settings"}
          >
            <Music size={20} className="text-slate-600" />
          </a>
        </div>
      </div>

      <div className="md:hidden bg-slate-50 border-t border-slate-200 px-4 py-3 flex gap-4 overflow-x-auto text-xs font-medium">
        <Link href="#calendar" className="text-slate-600 hover:text-slate-900 whitespace-nowrap">
          Calendar
        </Link>
        <Link href="#portfolio" className="text-slate-600 hover:text-slate-900 whitespace-nowrap">
          Portfolio
        </Link>
        <Link href="#packages" className="text-slate-600 hover:text-slate-900 whitespace-nowrap">
          Packages
        </Link>
        <Link href="#inquiry" className="text-slate-600 hover:text-slate-900 whitespace-nowrap">
          Inquiry
        </Link>
      </div>
    </header>
  );
}
