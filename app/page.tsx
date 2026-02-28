import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import {
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  SERVICE_SEO,
  SITE_URL,
  buildPageMetadata,
  toJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: DEFAULT_SEO_TITLE,
  description: DEFAULT_SEO_DESCRIPTION,
  path: "/",
  keywords: [
    "photographer Kuala Lumpur",
    "photographer Selangor",
    "whatsapp photography booking",
    "fotografi profesional Malaysia",
  ],
});

export default function HomePage() {
  const servicesListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Raygraphy Photography Services",
    itemListElement: Object.values(SERVICE_SEO).map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${service.nameEn} / ${service.nameMs}`,
      url: `${SITE_URL}/services/${service.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(servicesListSchema) }}
      />
      <HomePageClient />
    </>
  );
}

