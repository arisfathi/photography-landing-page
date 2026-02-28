"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type DynamicFaviconProps = {
  href: string;
  appleHref?: string;
};

type LogoUpdatedDetail = {
  logoUrl?: string | null;
  updatedAt?: string | null;
};

const LOGO_UPDATED_EVENT = "raygraphy:logo-updated";

function addVersion(url: string, updatedAt?: string | null) {
  const version = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  return `${url}${url.includes("?") ? "&" : "?"}v=${version}`;
}

function upsertLink(rel: string, href: string) {
  if (!href) return;
  const existing = document.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
  if (existing) {
    existing.href = href;
    return;
  }
  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  document.head.appendChild(link);
}

export default function DynamicFavicon({ href, appleHref }: DynamicFaviconProps) {
  const [liveHref, setLiveHref] = useState<string | null>(null);
  const iconHref = liveHref ?? href;
  const iconAppleHref = liveHref ?? appleHref ?? href;

  useEffect(() => {
    if (typeof document === "undefined") return;
    upsertLink("icon", iconHref);
    upsertLink("shortcut icon", iconHref);
    upsertLink("apple-touch-icon", iconAppleHref);
  }, [iconHref, iconAppleHref]);

  useEffect(() => {
    let active = true;

    const refreshFromSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("logo_url, updated_at")
        .eq("id", 1)
        .maybeSingle();

      if (!active || error || !data?.logo_url) return;
      const next = addVersion(data.logo_url, data.updated_at);
      setLiveHref(next);
    };

    void refreshFromSettings();

    const onLogoUpdated = (event: Event) => {
      const detail = (event as CustomEvent<LogoUpdatedDetail>).detail;
      if (!detail?.logoUrl) return;
      const next = addVersion(detail.logoUrl, detail.updatedAt);
      setLiveHref(next);
    };

    if (typeof window !== "undefined") {
      window.addEventListener(LOGO_UPDATED_EVENT, onLogoUpdated as EventListener);
    }

    return () => {
      active = false;
      if (typeof window !== "undefined") {
        window.removeEventListener(LOGO_UPDATED_EVENT, onLogoUpdated as EventListener);
      }
    };
  }, []);

  return null;
}
