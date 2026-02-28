"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FacebookCircleIcon from "@remixicons/react/line/FacebookCircleIcon";
import InstagramIcon from "@remixicons/react/line/InstagramIcon";
import PhoneIcon from "@remixicons/react/line/PhoneIcon";
import TiktokIcon from "@remixicons/react/line/TiktokIcon";
import type { SiteSettings } from "@/lib/getSettings";
import Image from "next/image";


type HeaderProps = {
  settings: SiteSettings | null;
};

export default function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const brand = settings?.brand_name || "Raygraphy";
  const brandDomain = settings?.brand_domain || "raygraphy.co";
  const phone = settings?.contact_phone || "";
  const instagram = settings?.instagram_url || "";
  const facebook = settings?.facebook_url || "";
  const tiktok = settings?.tiktok_url || "";
  const logoUrl = settings?.logo_url || "/logo.svg";
  const isGallery = pathname === "/gallery";
  const isServices = pathname.startsWith("/services");

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src={logoUrl}
            alt="Raygraphy photography logo"
            width={256}
            height={256}
            className="h-10 w-10 object-contain"
          />
          <span className="text-lg sm:text-xl font-bold text-slate-900">
            {brandDomain || brand}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-slate-600 text-sm font-medium">
          <Link
            href="/services"
            className={`hover:text-slate-900 transition ${
              isServices ? "text-slate-900 font-semibold" : ""
            }`}
          >
            Services
          </Link>
          <Link href="/#portfolio" className="hover:text-slate-900 transition">
            Portfolio
          </Link>
          <Link
            href="/gallery"
            className={`hover:text-slate-900 transition ${
              isGallery ? "text-slate-900 font-semibold" : ""
            }`}
          >
            Gallery
          </Link>
          <Link href="/#packages" className="hover:text-slate-900 transition">
            Packages
          </Link>
                    <Link href="/#calendar" className="hover:text-slate-900 transition">
            Calendar
          </Link>
          <Link href="/#inquiry" className="hover:text-slate-900 transition">
            Inquiry
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Phone */}
          <a
            href={phone ? `tel:${phone}` : "#inquiry"}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Call"
            title={phone ? phone : "Set phone in admin/settings"}
          >
            <PhoneIcon className="h-5 w-5 text-slate-600 fill-current" />
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
            <InstagramIcon className="h-5 w-5 text-slate-600 fill-current" />
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
            <TiktokIcon className="h-5 w-5 text-slate-600 fill-current" />
          </a>

          {/* Facebook */}
          <a
            href={facebook || "#inquiry"}
            target={facebook ? "_blank" : undefined}
            rel={facebook ? "noopener noreferrer" : undefined}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Facebook"
            title={facebook ? "Facebook" : "Set Facebook in admin/settings"}
          >
            <FacebookCircleIcon className="h-5 w-5 text-slate-600 fill-current" />
          </a>

        </div>
      </div>

      <div className="md:hidden bg-slate-50 border-t border-slate-200 px-3 sm:px-4 py-3 flex flex-wrap justify-center gap-3 text-xs sm:text-sm font-medium">
        <Link
          href="/services"
          className={`text-slate-600 hover:text-slate-900 whitespace-nowrap ${
            isServices ? "text-slate-900 font-semibold" : ""
          }`}
        >
          Services
        </Link>
        <Link href="/#calendar" className="text-slate-600 hover:text-slate-900 whitespace-nowrap">
          Calendar
        </Link>
        <Link href="/#portfolio" className="text-slate-600 hover:text-slate-900 whitespace-nowrap">
          Portfolio
        </Link>
        <Link
          href="/gallery"
          className={`text-slate-600 hover:text-slate-900 whitespace-nowrap ${
            isGallery ? "text-slate-900 font-semibold" : ""
          }`}
        >
          Gallery
        </Link>
        <Link href="/#packages" className="text-slate-600 hover:text-slate-900 whitespace-nowrap">
          Packages
        </Link>
        <Link href="/#inquiry" className="text-slate-600 hover:text-slate-900 whitespace-nowrap">
          Inquiry
        </Link>
      </div>
    </header>
  );
}
