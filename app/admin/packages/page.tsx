"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getSession, isAdmin } from "@/lib/auth";
import { getPhotographyTypes } from "@/lib/getPhotographyTypes";
import type { PhotographyType } from "@/lib/getPhotographyTypes";

type PackageCategory = string;

type PackageRow = {
  id: string;
  category: PackageCategory;
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

type PackageForm = {
  id?: string;
  category: PackageCategory;
  name: string;
  price: string;
  description: string;
  featuresText: string;
  highlighted: boolean;
  sort_order: number;
  is_active: boolean;
};

const emptyForm = (category: PackageCategory): PackageForm => ({
  category,
  name: "",
  price: "",
  description: "",
  featuresText: "",
  highlighted: false,
  sort_order: 0,
  is_active: true,
});

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function arrayToLines(arr: string[] | null | undefined): string {
  return (arr ?? []).join("\n");
}

export default function AdminPackagesPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  const [category, setCategory] = useState<PackageCategory>("convocation");
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<PhotographyType[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PackageForm>(emptyForm("convocation"));

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      const userId = session?.user?.id;

      if (!userId) {
        router.replace("/admin/login");
        return;
      }

      const check = await isAdmin(userId);
      if (!check.success || !check.isAdmin) {
        router.replace("/admin/login");
        return;
      }

      setChecking(false);
    })();
  }, [router]);

  useEffect(() => {
    if (checking) return;
    (async () => {
      const list = await getPhotographyTypes();
      setTypes(list);
      if (list.length > 0 && !list.some((t) => t.slug === category)) {
        setCategory(list[0].slug);
      }
    })();
  }, [checking, category]);

  useEffect(() => {
    if (checking) return;
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, checking]);

  useEffect(() => {
    if (!formOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [formOpen]);

  const fetchPackages = async () => {
    setLoading(true);
    setErr(null);
    setMsg(null);

    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("category", category)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setPackages((data as PackageRow[]) ?? []);
    setLoading(false);
  };

  const sorted = useMemo(() => {
    return [...packages].sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.created_at.localeCompare(b.created_at);
    });
  }, [packages]);

  const getTypeLabel = useCallback(
    (slug: string): string => {
      const match = types.find((t) => t.slug === slug);
      if (match) return match.name;
      return slug.charAt(0).toUpperCase() + slug.slice(1);
    },
    [types]
  );

  const categoryOptions = useMemo(() => {
    if (types.length > 0) return types.map((t) => ({ slug: t.slug, label: t.name }));
    return [{ slug: category, label: getTypeLabel(category) }];
  }, [types, category, getTypeLabel]);

  const openAdd = () => {
    setErr(null);
    setMsg(null);
    setForm(emptyForm(category));
    setFormOpen(true);
  };

  const openEdit = (row: PackageRow) => {
    setErr(null);
    setMsg(null);
    setForm({
      id: row.id,
      category: row.category,
      name: row.name,
      price: row.price,
      description: row.description,
      featuresText: arrayToLines(row.features),
      highlighted: row.highlighted,
      sort_order: row.sort_order ?? 0,
      is_active: row.is_active,
    });
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const onSave = async () => {
    setErr(null);
    setMsg(null);
    setSaving(true);

    if (!form.name.trim() || !form.price.trim() || !form.description.trim()) {
      setErr("Please fill in name, price and description.");
      setSaving(false);
      return;
    }

    const payload = {
      category: form.category,
      name: form.name.trim(),
      price: form.price.trim(),
      description: form.description.trim(),
      features: linesToArray(form.featuresText),
      highlighted: form.highlighted,
      sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
      is_active: form.is_active,
    };

    if (form.id) {
      const { error } = await supabase.from("packages").update(payload).eq("id", form.id);
      if (error) {
        setErr(error.message);
        setSaving(false);
        return;
      }
      setMsg("Package updated ✅");
    } else {
      const { error } = await supabase.from("packages").insert(payload);
      if (error) {
        setErr(error.message);
        setSaving(false);
        return;
      }
      setMsg("Package added ✅");
    }

    setSaving(false);
    setFormOpen(false);
    await fetchPackages();
  };

  const onDelete = async (row: PackageRow) => {
    const ok = confirm(`Delete package "${row.name}"?`);
    if (!ok) return;

    setErr(null);
    setMsg(null);

    const { error } = await supabase.from("packages").delete().eq("id", row.id);
    if (error) {
      setErr(error.message);
      return;
    }

    setPackages((prev) => prev.filter((p) => p.id !== row.id));
    setMsg("Deleted ✅");
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl text-slate-800 font-medium">Checking admin access...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Packages</h1>
            <p className="text-sm text-slate-700 mt-1">Add/edit packages per category.</p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
          >
            Back
          </button>
        </div>

        {(msg || err) && (
          <div
            className={`mt-6 rounded-lg border p-3 text-sm font-medium ${
              err
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            {err ?? msg}
          </div>
        )}

        {/* Category Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categoryOptions.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                category === c.slug
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-300 text-slate-900 hover:bg-slate-100"
              }`}
            >
              {c.label}
            </button>
          ))}

          <div className="flex-1" />

          <button
            onClick={openAdd}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition"
          >
            + Add Package
          </button>
        </div>

        {/* List */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {getTypeLabel(category)} Packages
            </h2>
            <button
              onClick={fetchPackages}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="mt-4 text-slate-800 text-sm font-medium">Loading...</p>
          ) : sorted.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-800 font-medium">
              No packages in this category yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {sorted.map((row) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-slate-200 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 text-base">{row.name}</p>
                      <span className="text-sm font-bold text-slate-700">• {row.price}</span>

                      {row.highlighted && (
                        <span className="rounded-lg bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800">
                          HIGHLIGHT
                        </span>
                      )}

                      <span
                        className={`rounded-lg px-2 py-1 text-xs font-bold ${
                          row.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {row.is_active ? "ACTIVE" : "HIDDEN"}
                      </span>

                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-800">
                        Order: {row.sort_order}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 mt-1 font-medium">{row.description}</p>

                    {row.features?.length > 0 && (
                      <ul className="mt-2 list-disc ml-5 text-sm text-slate-700 font-medium">
                        {row.features.slice(0, 3).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                        {row.features.length > 3 && <li>+{row.features.length - 3} more…</li>}
                      </ul>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(row)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(row)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b flex items-start justify-between gap-3 sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {form.id ? "Edit Package" : "Add Package"}
                  </h3>
                  <p className="text-sm text-slate-700 font-medium mt-1">
                    Features: 1 line = 1 bullet.
                  </p>
                </div>
                <button
                  onClick={closeForm}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>

              <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-900">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, category: e.target.value as PackageCategory }))
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Name"
                  value={form.name}
                  onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                  placeholder="Basic / Premium"
                />

                <Input
                  label="Price"
                  value={form.price}
                  onChange={(v) => setForm((p) => ({ ...p, price: v }))}
                  placeholder="RM 199"
                />

                <Input
                  label="Description"
                  value={form.description}
                  onChange={(v) => setForm((p) => ({ ...p, description: v }))}
                  placeholder="Short description of this package"
                />

                <div>
                  <label className="text-sm font-bold text-slate-900">Features</label>
                  <textarea
                    value={form.featuresText}
                    onChange={(e) => setForm((p) => ({ ...p, featuresText: e.target.value }))}
                    rows={6}
                    placeholder={"10 edited photos\n2 outfit changes\n1 hour session"}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.highlighted}
                      onChange={(e) => setForm((p) => ({ ...p, highlighted: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <label className="text-sm font-semibold text-slate-900">Highlighted</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <label className="text-sm font-semibold text-slate-900">Active</label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-900">Sort order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value)}))}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="h-2" />
              </div>

              <div className="px-6 py-4 border-t flex items-center gap-2 sticky bottom-0 bg-white">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-white font-bold hover:bg-slate-800 transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 font-bold hover:bg-slate-100 transition disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Input(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-900">{props.label}</label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
      />
    </div>
  );
}
