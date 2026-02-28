import Link from "next/link";
import type { Metadata } from "next";
import {
  SERVICE_SEO,
  SITE_URL,
  buildPageMetadata,
  toJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Photography Services in Kuala Lumpur & Selangor | Raygraphy",
  description:
    "Explore portrait, convocation, and event photography services by Raygraphy in Kuala Lumpur and Selangor. Lihat pakej dan tempah melalui WhatsApp.",
  path: "/services",
  keywords: [
    "photography services KL",
    "photography packages Selangor",
    "portrait convocation event photographer",
  ],
});

export default function ServicesPage() {
  const services = Object.values(SERVICE_SEO);
  const servicesListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Raygraphy Service Categories",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${service.nameEn} / ${service.nameMs}`,
      url: `${SITE_URL}/services/${service.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(servicesListSchema) }}
      />

      <div className="mx-auto max-w-5xl">
        <h1 className="text-center text-3xl sm:text-4xl font-bold text-slate-900">
          Photography Services in KL & Selangor
        </h1>
        <p className="mt-3 text-center text-slate-700 max-w-3xl mx-auto">
          Raygraphy provides portrait, convocation, and event photography for
          clients across Kuala Lumpur and Selangor. Pilih kategori servis untuk
          lihat maklumat lanjut.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.slug}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900">
                {service.nameEn}
              </h2>
              <p className="text-sm text-slate-600 font-medium mt-1">
                {service.nameMs}
              </p>
              <p className="mt-4 text-sm text-slate-700">
                {service.heroDescription}
              </p>

              <Link
                href={`/services/${service.slug}`}
                className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition"
              >
                View {service.nameEn}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/#inquiry"
            className="inline-flex rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
          >
            WhatsApp Booking
          </Link>
        </div>
      </div>
    </main>
  );
}

