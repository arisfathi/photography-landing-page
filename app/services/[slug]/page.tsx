import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SERVICE_AREAS,
  SERVICE_SEO,
  SERVICE_SLUGS,
  SITE_URL,
  ServiceSlug,
  buildPageMetadata,
  toJsonLd,
  toLabelFromSlug,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function isServiceSlug(slug: string): slug is ServiceSlug {
  return slug in SERVICE_SEO;
}

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isServiceSlug(slug)) {
    return buildPageMetadata({
      title: "Photography Services | Raygraphy",
      description:
        "Portrait, convocation, and event photography in Kuala Lumpur and Selangor.",
      path: "/services",
    });
  }

  const service = SERVICE_SEO[slug];
  return buildPageMetadata({
    title: service.title,
    description: service.description,
    path: `/services/${slug}`,
    keywords: service.keywords,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isServiceSlug(slug)) {
    notFound();
  }

  const service = SERVICE_SEO[slug];
  const url = `${SITE_URL}/services/${slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: `${SITE_URL}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.nameEn,
        item: url,
      },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: `${service.nameEn} in Kuala Lumpur & Selangor`,
    alternateName: service.nameMs,
    description: service.description,
    serviceType: service.nameEn,
    provider: {
      "@id": `${SITE_URL}/#localbusiness`,
    },
    areaServed: SERVICE_AREAS.map((area) => ({
      "@type": "AdministrativeArea",
      name: area,
    })),
    availableLanguage: ["en", "ms"],
    url,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.nameEn} Packages`,
      itemListElement: service.packages.map((pkg) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: pkg.name,
          description: pkg.description,
        },
        url: `${SITE_URL}/#packages`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(serviceSchema) }}
      />

      <div className="mx-auto max-w-5xl">
        <nav className="text-sm text-slate-600" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-slate-900">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/services" className="hover:text-slate-900">
                Services
              </Link>
            </li>
            <li>/</li>
            <li className="text-slate-900 font-semibold">
              {toLabelFromSlug(service.slug)}
            </li>
          </ol>
        </nav>

        <header className="mt-6 rounded-2xl bg-slate-900 text-white p-8 sm:p-10">
          <p className="text-xs font-semibold tracking-wide uppercase text-slate-200">
            Kuala Lumpur & Selangor
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold">
            {service.heroTitle}
          </h1>
          <p className="mt-4 text-slate-200 max-w-3xl">
            {service.heroDescription}
          </p>
        </header>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Package Types / Jenis Pakej
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {service.packages.map((pkg) => (
              <article
                key={pkg.name}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <h3 className="text-base font-bold text-slate-900">{pkg.name}</h3>
                <p className="mt-2 text-sm text-slate-700">{pkg.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-bold text-emerald-900">
            Ready to book via WhatsApp?
          </h2>
          <p className="mt-2 text-sm text-emerald-900">
            Continue to the booking section and contact Raygraphy on WhatsApp
            for the latest availability and package quotation.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/#packages"
              className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition"
            >
              View Packages
            </Link>
            <Link
              href="/#inquiry"
              className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition"
            >
              WhatsApp Inquiry
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

