"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getSession, isAdmin } from "@/lib/auth";
import { CATEGORIES, getCategoryLabel } from "@/lib/categories";


type Category = "convocation" | "wedding" | "event";

type PhotoRow = {
  id: string;
  category: Category;
  title: string;
  alt: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export default function AdminPortfolioPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  const [category, setCategory] = useState<Category>("convocation");
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Upload form
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Protect page
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

  // Fetch photos when category changes
  useEffect(() => {
    if (checking) return;
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, checking]);

  const fetchPhotos = async () => {
    setLoading(true);
    setErr(null);
    setMsg(null);

    const { data, error } = await supabase
      .from("portfolio_photos")
      .select("*")
      .eq("category", category)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setPhotos((data as PhotoRow[]) ?? []);
    setLoading(false);
  };

  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.created_at.localeCompare(b.created_at);
    });
  }, [photos]);

  const onUpload = async () => {
    setErr(null);
    setMsg(null);

    if (!file) {
      setErr("Please choose an image file.");
      return;
    }
    if (!title.trim()) {
      setErr("Please enter a title.");
      return;
    }
    if (!alt.trim()) {
      setErr("Please enter alt text.");
      return;
    }

    setUploading(true);

    const path = `${category}/${Date.now()}-${safeFileName(file.name)}`;

    // 1) Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setErr(uploadError.message);
      setUploading(false);
      return;
    }

    // 2) Get public URL
    const { data: publicData } = supabase.storage.from("portfolio").getPublicUrl(path);
    const publicUrl = publicData.publicUrl;

    // 3) Insert DB row
    const payload = {
      category,
      title: title.trim(),
      alt: alt.trim(),
      image_url: publicUrl,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_active: isActive,
    };

    const { error: insertError } = await supabase.from("portfolio_photos").insert(payload);

    if (insertError) {
      setErr(insertError.message);
      setUploading(false);
      return;
    }

    setMsg("Uploaded ✅");

    // Reset form
    setFile(null);
    setTitle("");
    setAlt("");
    setSortOrder(0);
    setIsActive(true);

    // Clear preview safely
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    await fetchPhotos();
    setUploading(false);
  };

  const onDelete = async (row: PhotoRow) => {
    const ok = confirm(`Delete "${row.title}"? (This removes DB record only)`);
    if (!ok) return;

    setErr(null);
    setMsg(null);

    const { error } = await supabase.from("portfolio_photos").delete().eq("id", row.id);

    if (error) {
      setErr(error.message);
      return;
    }

    setPhotos((prev) => prev.filter((p) => p.id !== row.id));
    setMsg("Deleted ✅ (file still in Storage)");
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl text-slate-800 font-medium">
          Checking admin access...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Portfolio</h1>
            <p className="text-sm text-slate-700 mt-1">
              Upload photos and organize by category.
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

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {/* Left */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1">
            <label className="block text-sm font-bold text-slate-900">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="convocation">Convocation</option>
              <option value="wedding">Wedding</option>
              <option value="event">Event</option>
            </select>

            <div className="mt-6">
              <h2 className="text-sm font-bold text-slate-900">Upload Photo</h2>

              <label className="mt-3 block text-sm font-bold text-slate-900">
                Image file
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);

                  // clean old preview
                  if (previewUrl) URL.revokeObjectURL(previewUrl);

                  if (f) {
                    const url = URL.createObjectURL(f);
                    setPreviewUrl(url);
                  } else {
                    setPreviewUrl(null);
                  }
                }}
                className="mt-2 w-full text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-slate-800"
              />

              {previewUrl && (
                <div className="mt-3 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <div className="aspect-[4/3]">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3 text-sm text-slate-700 font-medium">
                    Preview (before upload)
                  </div>
                </div>
              )}

              <label className="mt-4 block text-sm font-bold text-slate-900">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wedding couple"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
              />

              <label className="mt-4 block text-sm font-bold text-slate-900">
                Alt text
              </label>
              <input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Describe the photo for accessibility"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
              />

              <label className="mt-4 block text-sm font-bold text-slate-900">
                Sort order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
              />

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                <label className="text-sm font-semibold text-slate-900">
                  Active (show on website)
                </label>
              </div>

              <button
                onClick={onUpload}
                disabled={uploading}
                className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 text-white font-bold hover:bg-slate-800 transition disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>

              <p className="mt-3 text-sm text-slate-700">
                Tip: If you want “delete file from Storage” later, we can add a column to store the file path.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {category.charAt(0).toUpperCase() + category.slice(1)} Photos
              </h2>
              <button
                onClick={fetchPhotos}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="mt-4 text-slate-800 text-sm font-medium">Loading...</p>
            ) : sortedPhotos.length === 0 ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-800 font-medium">
                No photos yet. Upload one on the left.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {sortedPhotos.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-xl border border-slate-200 overflow-hidden bg-white"
                  >
                    <div className="aspect-[4/3] bg-slate-100">
                      <img
                        src={row.image_url}
                        alt={row.alt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900 text-base">{row.title}</p>
                        <span
                          className={`rounded-lg px-2 py-1 text-xs font-bold ${
                            row.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {row.is_active ? "ACTIVE" : "HIDDEN"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 mt-2 font-medium">
                        Order: {row.sort_order}
                      </p>

                      <div className="mt-3 flex gap-2">
                        <a
                          href={row.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100 transition text-center"
                        >
                          View
                        </a>
                        <button
                          onClick={() => onDelete(row)}
                          className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>

                      <p className="mt-2 text-sm text-slate-700 font-medium">
                        Deleting removes DB record only (file stays in Storage).
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
