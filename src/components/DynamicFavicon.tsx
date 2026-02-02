"use client";

import { useEffect } from "react";

type DynamicFaviconProps = {
  href: string;
  appleHref?: string;
};

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
  useEffect(() => {
    if (typeof document === "undefined") return;
    upsertLink("icon", href);
    upsertLink("apple-touch-icon", appleHref ?? href);
  }, [href, appleHref]);

  return null;
}
