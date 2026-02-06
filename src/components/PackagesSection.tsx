"use client";

import { useEffect, useMemo, useState } from "react";
import type { SiteSettings } from "@/lib/getSettings";
import { supabase } from "@/lib/supabaseClient";
import type { PackageCategory } from "@/lib/types";
import { getPhotographyTypes } from "@/lib/getPhotographyTypes";
import type { PhotographyType } from "@/lib/getPhotographyTypes";
import type { SelectedPackage } from "@/lib/bookingTypes";

type PackageRow = {
  id: string;
  category: PackageCategory;
  name: string;
  price: string;
  description: string;
  features: string[]; // jsonb array
  highlighted: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

interface PackagesSectionProps {
  selectedCategory: PackageCategory | null;
  settings: SiteSettings | null;
  onSelectPackage: (data: {
    category: PackageCategory;
    categoryLabel: string;
    pkg: SelectedPackage;
  }) => void;
}

export default function PackagesSection({
  selectedCategory,
  settings,
  onSelectPackage,
}: PackagesSectionProps) {
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<PhotographyType[]>([]);

  const waNumber = settings?.contact_phone || settings?.whatsapp_number || ""; // no + sign

  useEffect(() => {
    if (!selectedCategory) {
      setPackages([]);
      setError(null);
      setLoading(false);
      return;
    }
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  useEffect(() => {
    (async () => {
      const list = await getPhotographyTypes();
      setTypes(list);
    })();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    if (!selectedCategory) {
      setPackages([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("category", selectedCategory)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      setPackages([]);
      setLoading(false);
      return;
    }

    setPackages((data as PackageRow[]) ?? []);
    setLoading(false);
  };

  const getCategoryLabel = (category: PackageCategory): string => {
    const match = types.find((t) => t.slug === category);
    if (match) return match.name;
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const sorted = useMemo(() => {
    return [...packages].sort((a, b) => {
      if ((a.sort_order ?? 0) !== (b.sort_order ?? 0)) return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      return a.created_at.localeCompare(b.created_at);
    });
  }, [packages]);

  const buildWhatsAppUrl = () => {
    const digits = waNumber.replace(/\D/g, "");
    if (!digits) return "#inquiry";
    const categoryLabel = selectedCategory ? getCategoryLabel(selectedCategory) : "photography";
    const msg = encodeURIComponent(
      `Hi ${settings?.brand_name || "Raygraphy"}!

I'm interested in your ${categoryLabel} package.

Please share availability and pricing details.

Thank you!`
    );
    return `https://wa.me/${digits}?text=${msg}`;
  };

  const handleSelectPackage = (pkg: PackageRow) => {
    if (!selectedCategory) return;
    onSelectPackage({
      category: selectedCategory,
      categoryLabel: getCategoryLabel(selectedCategory),
      pkg: {
        id: pkg.id,
        category: selectedCategory,
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        features: pkg.features ?? [],
      },
    });

    const el = document.getElementById("calendar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="packages" className="py-12 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
          {selectedCategory ? `${getCategoryLabel(selectedCategory)} Packages` : "Packages"}
        </h2>

        <p className="text-slate-700 text-center mb-12 max-w-2xl mx-auto font-medium">
          Choose the package that best fits your needs. Final quotation will be provided after discussion.
        </p>

        {!selectedCategory ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-900 font-bold text-lg">No categories available</p>
            <p className="mt-2 text-slate-700 font-medium">Please check back later.</p>
          </div>
        ) : loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-800 font-medium">
            Loading packages...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800 font-medium">
            {error}
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-900 font-bold text-lg">Not available</p>
            <p className="mt-2 text-slate-700 font-medium">
              Please contact us on WhatsApp for a custom quote.
            </p>

            <a
              href={waNumber ? buildWhatsAppUrl() : "#inquiry"}
              target={waNumber ? "_blank" : undefined}
              rel={waNumber ? "noopener noreferrer" : undefined}
              className="inline-block mt-6 rounded-lg bg-slate-900 px-6 py-3 text-white font-bold hover:bg-slate-800 transition"
            >
              {waNumber ? "Contact on WhatsApp" : "Set Contact Phone in Settings"}
            </a>
          </div>
        ) : (
          <div
            className={`grid ${
              sorted.length === 1 ? "md:grid-cols-1" : sorted.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
            } gap-6 lg:gap-8 items-stretch`}
          >
            {sorted.map((pkg) => (
              <div
                key={pkg.id}
                className={`h-full flex flex-col rounded-lg shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-xl ${
                  pkg.highlighted ? "md:scale-105 bg-slate-900 text-white md:shadow-lg" : "bg-white"
                }`}
              >
                <div
                  className={`p-6 ${
                    pkg.highlighted ? "bg-gradient-to-br from-slate-900 to-slate-800" : "bg-slate-50"
                  }`}
                >
                  <h3 className={`text-2xl font-bold ${pkg.highlighted ? "text-white" : "text-slate-900"}`}>
                    {pkg.name}
                  </h3>
                  <p className={`text-sm mt-2 font-medium ${pkg.highlighted ? "text-slate-200" : "text-slate-700"}`}>
                    {pkg.description}
                  </p>
                </div>

                <div className={`p-6 flex-1 flex flex-col ${pkg.highlighted ? "bg-slate-800" : "bg-white"}`}>
                  <div className="flex-1">
                    <div className="mb-6">
                      <p className={`text-sm font-medium ${pkg.highlighted ? "text-slate-200" : "text-slate-700"}`}>
                        from
                      </p>
                      <span className={`text-3xl font-bold ${pkg.highlighted ? "text-white" : "text-slate-900"}`}>
                        {pkg.price}
                      </span>
                    </div>

                    <ul className="space-y-3">
                      {(pkg.features ?? []).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className={`${pkg.highlighted ? "text-green-300" : "text-green-600"} font-bold mt-1`}>
                            ✓
                          </span>
                          <span className={`text-sm font-medium ${pkg.highlighted ? "text-slate-100" : "text-slate-800"}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-4">
                    <button
                      type="button"
                      onClick={() => handleSelectPackage(pkg)}
                      className={`block w-full text-center py-3 rounded-lg font-bold transition text-sm ${
                        pkg.highlighted
                          ? "bg-white text-slate-900 hover:bg-slate-100"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      Select Date
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}




