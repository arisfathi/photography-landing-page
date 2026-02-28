import type { Metadata } from "next";

export const SITE_URL = "https://raygraphy.co";
export const SITE_NAME = "Raygraphy";
export const SITE_LOCALE = "en_MY";
export const ALT_LOCALE = "ms_MY";
export const SERVICE_AREAS = ["Kuala Lumpur", "Selangor"];

export const DEFAULT_SEO_TITLE =
  "Raygraphy | Portrait, Convocation & Event Photography in Kuala Lumpur & Selangor";
export const DEFAULT_SEO_DESCRIPTION =
  "Raygraphy provides portrait, convocation, and event photography in Kuala Lumpur and Selangor. Tempah sesi fotografi anda sekarang melalui WhatsApp.";

export type ServiceSlug = "portrait" | "convocation" | "event";

type ServicePackage = {
  name: string;
  description: string;
};

export type ServiceSeoDefinition = {
  slug: ServiceSlug;
  nameEn: string;
  nameMs: string;
  title: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  keywords: string[];
  packages: ServicePackage[];
};

export const SERVICE_SEO: Record<ServiceSlug, ServiceSeoDefinition> = {
  portrait: {
    slug: "portrait",
    nameEn: "Portrait Photography",
    nameMs: "Fotografi Potret",
    title:
      "Portrait Photography in Kuala Lumpur & Selangor | Fotografi Potret KL",
    description:
      "Professional portrait photography in Kuala Lumpur and Selangor for personal branding, individuals, and families. Sesi potret profesional dengan tempahan WhatsApp.",
    heroTitle: "Portrait Photography / Fotografi Potret",
    heroDescription:
      "Studio-style and outdoor portrait sessions for individuals, couples, and families across KL and Selangor.",
    keywords: [
      "portrait photography Kuala Lumpur",
      "portrait photographer Selangor",
      "fotografi potret KL",
      "professional portrait photoshoot Malaysia",
    ],
    packages: [
      {
        name: "Personal Portrait Session",
        description:
          "Individual portrait session with guided posing and professionally edited final photos.",
      },
      {
        name: "Family Portrait Session",
        description:
          "Family-focused portrait coverage with natural and formal group compositions.",
      },
      {
        name: "Branding Portrait Session",
        description:
          "Portraits for creators and professionals for social profiles and marketing use.",
      },
    ],
  },
  convocation: {
    slug: "convocation",
    nameEn: "Convocation Photography",
    nameMs: "Fotografi Konvokesyen",
    title:
      "Convocation Photography in Kuala Lumpur & Selangor | Fotografi Konvo",
    description:
      "Book convocation photography in Kuala Lumpur and Selangor for graduation day portraits and group photos. Tempah jurugambar konvokesyen melalui WhatsApp.",
    heroTitle: "Convocation Photography / Fotografi Konvokesyen",
    heroDescription:
      "Capture graduation milestones with polished solo portraits and memorable group photos around your campus.",
    keywords: [
      "convocation photographer Kuala Lumpur",
      "graduation photography Selangor",
      "fotografi konvokesyen",
      "jurugambar konvo KL",
    ],
    packages: [
      {
        name: "Solo Convocation Package",
        description:
          "Focused graduation portrait session for the graduate with a curated set of edited images.",
      },
      {
        name: "Friends Group Convocation Package",
        description:
          "Group coverage designed for classmates and friends with multiple pose sets.",
      },
      {
        name: "Family Convocation Package",
        description:
          "Convocation day portraits with parents and siblings at key campus locations.",
      },
    ],
  },
  event: {
    slug: "event",
    nameEn: "Event Photography",
    nameMs: "Fotografi Acara",
    title: "Event Photography in Kuala Lumpur & Selangor | Fotografi Event",
    description:
      "Event photography services in Kuala Lumpur and Selangor for corporate, community, and private events. Jurugambar acara profesional dengan tempahan WhatsApp.",
    heroTitle: "Event Photography / Fotografi Acara",
    heroDescription:
      "Reliable event coverage for conferences, celebrations, and branded activations with fast delivery workflow.",
    keywords: [
      "event photographer Kuala Lumpur",
      "event photography Selangor",
      "corporate event photographer Malaysia",
      "fotografi acara KL",
    ],
    packages: [
      {
        name: "Corporate Event Coverage",
        description:
          "Professional documentation for conferences, launches, and networking events.",
      },
      {
        name: "Private Event Coverage",
        description:
          "Photography for birthdays, dinners, and personal celebrations with candid storytelling.",
      },
      {
        name: "Half-Day Event Package",
        description:
          "Short-format event package tailored for compact schedules and key moments.",
      },
    ],
  },
};

export const SERVICE_SLUGS = Object.keys(SERVICE_SEO) as ServiceSlug[];

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith("/")) return `${SITE_URL}/${path}`;
  return `${SITE_URL}${path}`;
}

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  imagePath?: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  imagePath = "/raygraphy-og.svg",
}: BuildMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const ogImageUrl = absoluteUrl(imagePath);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: [
      // Brand + general
      "Raygraphy",
      "Raygraphy photography",
      "Raygraphy photographer",
      "Raygraphy Kuala Lumpur",
      "Raygraphy Selangor",

      // Photographer Malaysia
      "photographer Malaysia",
      "professional photographer Malaysia",
      "freelance photographer Malaysia",
      "best photographer Malaysia",
      "photography services Malaysia",
      "photography package Malaysia",
      "photography price Malaysia",
      "photography rates Malaysia",

      // KL / Selangor broad
      "photographer Kuala Lumpur",
      "photographer KL",
      "photography Kuala Lumpur",
      "photography KL",
      "photographer Selangor",
      "photography Selangor",
      "Kuala Lumpur photographer",
      "KL photographer",
      "Selangor photographer",
      "KL photography services",
      "Selangor photography services",
      "photographer near me KL",
      "photographer near me Selangor",

      // Wedding (EN)
      "wedding photographer Malaysia",
      "wedding photographer Kuala Lumpur",
      "wedding photographer KL",
      "wedding photographer Selangor",
      "wedding photography Malaysia",
      "wedding photography Kuala Lumpur",
      "wedding photography KL",
      "wedding photography Selangor",
      "wedding photo package Malaysia",
      "wedding photo package KL",
      "wedding photography price Malaysia",
      "wedding photography rates KL",
      "prewedding photographer Malaysia",
      "prewedding photographer KL",
      "prewedding photography Kuala Lumpur",
      "pre wedding photographer KL",
      "pre wedding photoshoot KL",
      "nikah photographer KL",
      "engagement photographer KL",
      "engagement photography Kuala Lumpur",
      "solemnization photographer KL",
      "wedding ceremony photographer KL",
      "wedding reception photographer KL",

      // Wedding (BM)
      "jurugambar kahwin Malaysia",
      "jurugambar kahwin Kuala Lumpur",
      "jurugambar kahwin KL",
      "jurugambar kahwin Selangor",
      "fotografi perkahwinan Malaysia",
      "fotografi perkahwinan Kuala Lumpur",
      "fotografi perkahwinan KL",
      "fotografi perkahwinan Selangor",
      "pakej fotografi kahwin Malaysia",
      "pakej jurugambar kahwin KL",
      "harga jurugambar kahwin KL",
      "harga fotografi kahwin Malaysia",
      "jurugambar nikah KL",
      "jurugambar tunang KL",
      "jurugambar sanding KL",
      "gambar kahwin KL",
      "gambar nikah KL",
      "gambar tunang KL",
      "gambar prewedding KL",
      "pakej prewedding KL",

      // Portrait (EN)
      "portrait photographer KL",
      "portrait photographer Kuala Lumpur",
      "portrait photographer Selangor",
      "portrait photography KL",
      "portrait photoshoot KL",
      "studio portrait KL",
      "outdoor portrait KL",
      "personal branding photographer KL",
      "personal branding photography KL",
      "professional headshot KL",
      "corporate headshot KL",
      "headshot photographer KL",
      "linkedin profile photo KL",
      "resume photo KL",
      "graduation portrait KL",
      "family portrait KL",
      "couple portrait KL",
      "kids portrait KL",
      "lifestyle photography KL",

      // Portrait (BM)
      "jurugambar potret KL",
      "jurugambar potret Kuala Lumpur",
      "jurugambar potret Selangor",
      "fotografi potret KL",
      "sesi fotografi potret KL",
      "gambar potret profesional KL",
      "gambar profil profesional KL",
      "gambar LinkedIn KL",
      "gambar korporat KL",
      "gambar headshot KL",
      "jurugambar keluarga KL",
      "fotografi keluarga KL",
      "jurugambar couple KL",
      "fotografi pasangan KL",
      "fotografi gaya hidup KL",

      // Convocation / Graduation (EN)
      "convocation photographer KL",
      "convocation photographer Kuala Lumpur",
      "convocation photographer Selangor",
      "convocation photography KL",
      "graduation photographer KL",
      "graduation photography Kuala Lumpur",
      "graduation photoshoot KL",
      "graduation portrait KL",
      "university graduation photographer KL",
      "campus photoshoot KL",
      "convo photoshoot KL",
      "convo photo package KL",

      // Convocation / Graduation (BM)
      "jurugambar konvokesyen KL",
      "jurugambar konvo KL",
      "jurugambar konvokesyen Kuala Lumpur",
      "jurugambar konvokesyen Selangor",
      "fotografi konvokesyen KL",
      "sesi konvokesyen KL",
      "gambar konvo KL",
      "pakej konvo KL",
      "pakej konvokesyen KL",
      "harga jurugambar konvo KL",
      "harga pakej konvo KL",
      "gambar graduasi KL",
      "jurugambar graduasi KL",
      "fotografi graduasi KL",
      "sesi graduasi KL",

      // Event (EN)
      "event photographer KL",
      "event photographer Kuala Lumpur",
      "event photographer Selangor",
      "event photography KL",
      "event photography Kuala Lumpur",
      "event photo coverage KL",
      "corporate event photographer KL",
      "company event photographer KL",
      "conference photographer KL",
      "seminar photographer KL",
      "workshop photographer KL",
      "product launch photographer KL",
      "brand activation photographer KL",
      "festival photographer KL",
      "birthday photographer KL",
      "birthday party photographer KL",
      "private event photographer KL",
      "school event photographer KL",
      "sports event photographer KL",

      // Event (BM)
      "jurugambar acara KL",
      "jurugambar event KL",
      "jurugambar event Kuala Lumpur",
      "jurugambar acara Selangor",
      "fotografi acara KL",
      "fotografi event KL",
      "liputan acara KL",
      "liputan fotografi acara KL",
      "jurugambar acara korporat KL",
      "jurugambar event korporat KL",
      "jurugambar seminar KL",
      "jurugambar persidangan KL",
      "jurugambar pelancaran produk KL",
      "jurugambar aktivasi jenama KL",
      "jurugambar hari jadi KL",
      "jurugambar majlis KL",
      "jurugambar majlis perkahwinan KL",

      // Common local areas (useful, Malaysia-friendly)
      "photographer Shah Alam",
      "photographer Subang Jaya",
      "photographer Petaling Jaya",
      "photographer PJ",
      "photographer Puchong",
      "photographer Cyberjaya",
      "photographer Putrajaya",
      "photographer Klang",
      "photographer Cheras",
      "photographer Ampang",
      "photographer Bangi",
      "jurugambar Shah Alam",
      "jurugambar Subang Jaya",
      "jurugambar Petaling Jaya",
      "jurugambar PJ",
      "jurugambar Puchong",
      "jurugambar Cyberjaya",
      "jurugambar Putrajaya",
      "jurugambar Klang",
      "jurugambar Cheras",
      "jurugambar Ampang",
      "jurugambar Bangi",
    ],
    alternates: {
      canonical,
      languages: {
        "en-MY": canonical,
        "ms-MY": canonical,
        "x-default": canonical,
      },
    },
    openGraph: {
      type: "website",
      locale: SITE_LOCALE,
      alternateLocale: [ALT_LOCALE],
      siteName: SITE_NAME,
      url: canonical,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} photography services in Kuala Lumpur and Selangor`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function toLabelFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

