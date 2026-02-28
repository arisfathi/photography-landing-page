"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { getSession, isAdmin } from "@/lib/auth";
import { getPhotographyTypes } from "@/lib/getPhotographyTypes";
import type { PhotographyType } from "@/lib/getPhotographyTypes";
import type { GalleryImage } from "@/lib/gallery";
import LightboxModal from "@/components/LightboxModal";
import DeleteBinIcon from "@remixicons/react/line/DeleteBinIcon";
import EyeIcon from "@remixicons/react/line/EyeIcon";
import GalleryUploadIcon from "@remixicons/react/line/GalleryUploadIcon";

type UploadItem = File;

const toSeoFileSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const buildPath = (category: string | null, file: File) => {
  const ext = file.name.split(".").pop() || "jpg";
  const fileBase = file.name.replace(/\.[^.]+$/, "");
  const seoFileName = toSeoFileSlug(fileBase) || "image";
  const safeCategory = toSeoFileSlug(category || "general") || "general";
  const rand = Math.random().toString(36).slice(2, 8);
  return `gallery/${safeCategory}/${Date.now()}_${seoFileName}_${rand}.${ext}`;
};

export default function AdminGalleryPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [types, setTypes] = useState<PhotographyType[]>([]);
  const [category, setCategory] = useState<string>("convocation");
  const [filter, setFilter] = useState<string>("all");
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sortMap, setSortMap] = useState<Record<string, number>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [adminDebug, setAdminDebug] = useState<{ userId: string | null; isAdmin: boolean }>({
    userId: null,
    isAdmin: false,
  });

  useEffect(() => {
    (async () => {
      const session = await getSession();
      const userId = session?.user?.id;

      if (!userId) {
        setAdminDebug({ userId: null, isAdmin: false });
        router.replace("/admin/login");
        return;
      }

      const check = await isAdmin(userId);
      if (!check.success || !check.isAdmin) {
        setAdminDebug({ userId, isAdmin: false });
        router.replace("/admin/login");
        return;
      }

      setAdminDebug({ userId, isAdmin: true });
      const list = await getPhotographyTypes();
      setTypes(list);
      if (list.length > 0) {
        setCategory(list[0].slug);
      }
      setChecking(false);
    })();
  }, [router]);

  const categoryOptions = useMemo(() => {
    if (types.length > 0) return types.map((t) => ({ slug: t.slug, label: t.name }));
    return [
      { slug: "convocation", label: "Convocation" },
      { slug: "event", label: "Event" },
      { slug: "pasar-seni", label: "Pasar Seni" },
    ];
  }, [types]);

  useEffect(() => {
    if (checking) return;
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, checking]);

  const fetchItems = async () => {
    setLoading(true);
    setErr(null);
    setMsg(null);

    let query = supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("category", filter);
    }

    const { data, error } = await query;

    if (error) {
      setErr(error.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const rows = (data as GalleryImage[]) ?? [];
    setItems(rows);
    const nextMap: Record<string, number> = {};
    rows.forEach((row) => {
      nextMap[row.id] = row.sort_order ?? 0;
    });
    setSortMap(nextMap);
    setLoading(false);
  };

  const onUpload = async () => {
    if (files.length === 0) {
      setErr("Please select at least one image.");
      return;
    }

    setSaving(true);
    setErr(null);
    setMsg(null);

    for (const file of files) {
      const path = buildPath(category || null, file);
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setErr(uploadError.message);
        setSaving(false);
        return;
      }

      const { data: publicData } = supabase.storage.from("gallery").getPublicUrl(path);
      const publicUrl = publicData.publicUrl;

      const payload = {
        url: publicUrl,
        path,
        category: category || null,
        sort_order: 0,
        is_active: true,
      };

      const { error: insertError } = await supabase.from("gallery_images").insert(payload);
      if (insertError) {
        setErr(insertError.message);
        setSaving(false);
        return;
      }
    }

    setFiles([]);
    setMsg("Upload complete");
    setSaving(false);
    await fetchItems();
  };

  const toggleActive = async (row: GalleryImage) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setErr("Please log in.");
      return;
    }

    const nextActive = !row.is_active;
    setTogglingId(row.id);
    setErr(null);
    setMsg(null);

    const { error } = await supabase
      .from("gallery_images")
      .update({ is_active: nextActive })
      .eq("id", row.id);

    if (error) {
      setErr(error.message);
      setTogglingId(null);
      return;
    }

    setItems((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, is_active: nextActive } : r))
    );
    setTogglingId(null);
  };


  const updateSortOrder = async (row: GalleryImage) => {
    const nextVal = sortMap[row.id] ?? 0;
    const { error } = await supabase
      .from("gallery_images")
      .update({ sort_order: nextVal })
      .eq("id", row.id);

    if (error) {
      setErr(error.message);
      return;
    }
  };

  const deleteItem = async (row: GalleryImage) => {
    const ok = confirm(`Delete this image? This cannot be undone.
Category: ${row.category || "general"}`);
    if (!ok) return;

    setErr(null);
    setMsg(null);
    setDeletingId(row.id);

    const path = row.path || getPathFromUrl("gallery", row.url);
    if (!path) {
      setErr("Missing storage path. Cannot delete file.");
      setDeletingId(null);
      return;
    }

    const { error: storageError } = await supabase.storage.from("gallery").remove([path]);
    if (storageError) {
      setErr(storageError.message);
      setDeletingId(null);
      return;
    }

    const { error } = await supabase.from("gallery_images").delete().eq("id", row.id);
    if (error) {
      setErr(error.message);
      setDeletingId(null);
      return;
    }

    setItems((prev) => prev.filter((r) => r.id !== row.id));
    setMsg("Deleted");
    setDeletingId(null);
  };

  const openPreview = (row: GalleryImage) => {
    const idx = items.findIndex((item) => item.id === row.id);
    if (idx >= 0) setLightboxIndex(idx);
  };

  const closePreview = () => setLightboxIndex(null);

  const nextPreview = () => {
    if (lightboxIndex === null || items.length === 0) return;
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % items.length));
  };

  const prevPreview = () => {
    if (lightboxIndex === null || items.length === 0) return;
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + items.length) % items.length
    );
  };

  const getShortId = (id: string) => id.slice(-6);

  const getFileName = (path?: string | null) => {
    if (!path) return "";
    const parts = path.split("/");
    return parts[parts.length - 1] || "";
  };

  const getPathFromUrl = (bucket: string, url?: string | null): string | null => {
    if (!url) return null;
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
  };


  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Copied image URL ✅");
    } catch {
      setErr("Failed to copy URL.");
    }
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
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gallery</h1>
            <p className="text-sm text-slate-700 mt-1">
              Upload and manage gallery images. No titles required.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Admin status: {adminDebug.userId ?? "not logged in"} •{" "}
              {adminDebug.isAdmin ? "admin" : "not admin"}
            </p>
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

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Upload Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-sm font-bold text-slate-900">Upload Images</h2>

            <label className="mt-4 block text-sm font-bold text-slate-900">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
            >
              {categoryOptions.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
              <option value="general">General</option>
            </select>

            <label className="mt-4 block text-sm font-bold text-slate-900">
              Image files
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="mt-2 w-full text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-slate-800"
            />

            <button
              onClick={onUpload}
              disabled={saving}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-white font-bold hover:bg-slate-800 transition disabled:opacity-60"
            >
              <GalleryUploadIcon className="h-5 w-5 fill-current" />
              {saving ? "Uploading..." : "Upload"}
            </button>

            {files.length > 0 && (
              <p className="mt-3 text-xs text-slate-600">
                {files.length} file(s) selected
              </p>
            )}
          </div>

          {/* Grid + Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-900">Gallery Items</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="all">All</option>
                {categoryOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
                <option value="general">General</option>
              </select>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                  Loading...
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                  No images yet. Upload on the left.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => openPreview(row)}
                          className="h-16 w-16 overflow-hidden rounded-lg bg-slate-100"
                          aria-label="Preview image"
                        >
                          <Image
                            src={row.url}
                            alt=""
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-semibold text-slate-900">
                              {row.category || "general"}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                                row.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-200 text-slate-800"
                              }`}
                            >
                              {row.is_active ? "Active" : "Hidden"}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            ID: {getShortId(row.id)}
                            {getFileName(row.path) ? ` • ${getFileName(row.path)}` : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-col items-start">
                          <label className="text-xs font-semibold text-slate-600">Order</label>
                          <input
                            type="number"
                            value={sortMap[row.id] ?? 0}
                            onChange={(e) =>
                              setSortMap((prev) => ({
                                ...prev,
                                [row.id]: Number(e.target.value),
                              }))
                            }
                            onBlur={() => updateSortOrder(row)}
                            className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-sm font-semibold text-slate-900"
                          />
                          <span className="mt-1 text-[11px] text-slate-500">Lower = earlier</span>
                        </div>

                        <button
                          onClick={() => openPreview(row)}
                          className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200"
                          title="Preview"
                        >
                          <EyeIcon className="h-4 w-4 fill-current" />
                        </button>

                        <button
                          onClick={() => toggleActive(row)}
                          disabled={togglingId === row.id}
                          className={`rounded-md px-3 py-2 text-xs font-semibold ${
                            row.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                          } disabled:opacity-60`}
                          title={row.is_active ? "Hide" : "Show"}
                        >
                          {togglingId === row.id ? "Saving..." : row.is_active ? "Hide" : "Show"}
                        </button>

                        <button
                          onClick={() => copyUrl(row.url)}
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                          title="Copy URL"
                        >
                          Copy URL
                        </button>

                        <button
                          onClick={() => deleteItem(row)}
                          disabled={deletingId === row.id}
                          className="rounded-md bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-60"
                          title="Delete"
                        >
                          <DeleteBinIcon className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <LightboxModal
        items={items}
        index={lightboxIndex}
        onClose={closePreview}
        onPrev={prevPreview}
        onNext={nextPreview}
      />
    </main>
  );
}
