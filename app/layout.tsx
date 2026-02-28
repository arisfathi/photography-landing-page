import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@supabase/supabase-js";
import DynamicFavicon from "@/components/DynamicFavicon";
import {
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  SERVICE_AREAS,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  toJsonLd,
} from "@/lib/seo";
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

type SiteSettingsRow = {
  brand_name: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  hero_banner_url: string | null;
  updated_at: string | null;
};

async function getSiteSettings(): Promise<SiteSettingsRow> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      brand_name: null,
      logo_url: null,
      favicon_url: null,
      contact_phone: null,
      whatsapp_number: null,
      instagram_url: null,
      facebook_url: null,
      tiktok_url: null,
      hero_banner_url: null,
      updated_at: null,
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase
    .from("site_settings")
    .select(
      "brand_name, logo_url, favicon_url, contact_phone, whatsapp_number, instagram_url, facebook_url, tiktok_url, hero_banner_url, updated_at"
    )
    .eq("id", 1)
    .single();

  return {
    brand_name: data?.brand_name ?? null,
    logo_url: data?.logo_url ?? null,
    favicon_url: data?.favicon_url ?? null,
    contact_phone: data?.contact_phone ?? null,
    whatsapp_number: data?.whatsapp_number ?? null,
    instagram_url: data?.instagram_url ?? null,
    facebook_url: data?.facebook_url ?? null,
    tiktok_url: data?.tiktok_url ?? null,
    hero_banner_url: data?.hero_banner_url ?? null,
    updated_at: data?.updated_at ?? null,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const fallbackIcon = "/raygraphy-favicon.svg";
  const version = settings.updated_at ? new Date(settings.updated_at).getTime() : 0;
  const base = settings.favicon_url ?? settings.logo_url ?? fallbackIcon;
  const iconUrl = `${base}${base.includes("?") ? "&" : "?"}v=${version}`;
  const socialImage = absoluteUrl(settings.hero_banner_url ?? settings.logo_url ?? "/raygraphy-og.svg");
  const googleSiteVerification =
    process.env.GOOGLE_SITE_VERIFICATION ||
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
    undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: DEFAULT_SEO_TITLE,
      template: "%s | Raygraphy",
    },
    description: DEFAULT_SEO_DESCRIPTION,
    applicationName: SITE_NAME,
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "Photography",
    keywords: [
      "Raygraphy",
      "photography Kuala Lumpur",
      "photography Selangor",
      "portrait photography",
      "convocation photography",
      "event photography",
      "fotografi potret",
      "fotografi konvokesyen",
      "fotografi acara",
      "jurugambar Kuala Lumpur",
      "jurugambar Selangor",
    ],
    alternates: {
      canonical: "/",
      languages: {
        "en-MY": "/",
        "ms-MY": "/",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: "en_MY",
      alternateLocale: ["ms_MY"],
      url: SITE_URL,
      siteName: SITE_NAME,
      title: DEFAULT_SEO_TITLE,
      description: DEFAULT_SEO_DESCRIPTION,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: "Raygraphy photography services in Kuala Lumpur and Selangor",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_SEO_TITLE,
      description: DEFAULT_SEO_DESCRIPTION,
      images: [socialImage],
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
    verification: {
      google: googleSiteVerification,
    },
    other: {
      "geo.region": "MY-14",
      "geo.placename": "Kuala Lumpur, Selangor",
      ICBM: "3.1390,101.6869",
    },
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
  const settings = await getSiteSettings();
  const base = settings.favicon_url ?? settings.logo_url ?? "/raygraphy-favicon.svg";
  const version = settings.updated_at ? new Date(settings.updated_at).getTime() : 0;
  const faviconHref = `${base}${base.includes("?") ? "&" : "?"}v=${version}`;
  const brandName = settings.brand_name ?? SITE_NAME;
  const socialLinks = [
    settings.instagram_url,
    settings.facebook_url,
    settings.tiktok_url,
  ].filter((url): url is string => Boolean(url));
  const whatsappDigits = (settings.whatsapp_number ?? "").replace(/\D/g, "");
  const whatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}` : null;
  if (whatsappUrl) socialLinks.push(whatsappUrl);

  const phoneNumber = settings.contact_phone ?? (whatsappDigits ? `+${whatsappDigits}` : null);
  const seoImageUrl = absoluteUrl(settings.logo_url ?? "/logo.svg");

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: brandName,
    url: SITE_URL,
    image: [seoImageUrl],
    logo: seoImageUrl,
    description: DEFAULT_SEO_DESCRIPTION,
    priceRange: "$$",
    areaServed: [
      {
        "@type": "City",
        name: SERVICE_AREAS[0],
      },
      {
        "@type": "AdministrativeArea",
        name: SERVICE_AREAS[1],
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kuala Lumpur",
      addressRegion: "Selangor",
      addressCountry: "MY",
    },
    sameAs: socialLinks,
    availableLanguage: ["en", "ms"],
    telephone: phoneNumber ?? undefined,
    contactPoint: phoneNumber
      ? [
          {
            "@type": "ContactPoint",
            telephone: phoneNumber,
            contactType: "customer service",
            availableLanguage: ["en", "ms"],
            areaServed: "MY",
          },
        ]
      : undefined,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: brandName,
    inLanguage: ["en-MY", "ms-MY"],
    publisher: {
      "@id": `${SITE_URL}/#localbusiness`,
    },
  };

  return (
    <html lang="en-MY">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(websiteSchema) }}
        />
        <DynamicFavicon href={faviconHref} />
        {children}
      </body>
    </html>
  );
}
