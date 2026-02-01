"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getSession, isAdmin } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AddIcon from "@remixicons/react/line/AddIcon";
import DeleteBinIcon from "@remixicons/react/line/DeleteBinIcon";

type PhotographyType = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type FormData = {
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

const emptyForm: FormData = {
  name: "",
  slug: "",
  is_active: true,
  sort_order: 0,
};

export default function AdminTypesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<PhotographyType[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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

      await loadTypes();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTypes = async () => {
    setLoading(true);
    setErrorMsg(null);
    setMessage(null);

    const { data, error } = await supabase
      .from("photography_types")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setTypes((data as PhotographyType[]) ?? []);
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleEdit = (type: PhotographyType) => {
    setForm({
      name: type.name,
      slug: type.slug,
      is_active: type.is_active,
      sort_order: type.sort_order,
    });
    setEditingId(type.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErrorMsg("Type name is required");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setMessage(null);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      is_active: form.is_active,
      sort_order: form.sort_order,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      // Update
      const { error } = await supabase
        .from("photography_types")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        setErrorMsg(error.message);
        setSaving(false);
        return;
      }
    } else {
      // Insert
      const { error } = await supabase.from("photography_types").insert([payload]);

      if (error) {
        setErrorMsg(error.message);
        setSaving(false);
        return;
      }
    }

    setMessage(editingId ? "Type updated ✅" : "Type added ✅");
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setSaving(false);
    await loadTypes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this type?")) return;

    setDeleting(id);
    setErrorMsg(null);
    setMessage(null);

    const { error } = await supabase.from("photography_types").delete().eq("id", id);

    if (error) {
      setErrorMsg(error.message);
      setDeleting(null);
      return;
    }

    setMessage("Type deleted ✅");
    setDeleting(null);
    await loadTypes();
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    setErrorMsg(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl text-slate-800 font-medium">
          Loading types...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-3 sm:px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Photography Types</h1>
            <p className="text-sm text-slate-700 mt-1">
              Manage convocation, wedding, event, and other types.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
          >
            Back
          </button>
        </div>

        {(message || errorMsg) && (
          <div
            className={`mb-6 rounded-lg border p-3 text-sm font-medium ${
              errorMsg
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            {errorMsg ?? message}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? "Edit Type" : "Add New Type"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Type Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Convocation"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Slug (auto-generated)
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g., convocation"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="mt-1 text-xs text-slate-600">
                  Auto-generated from name. Edit if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="mt-1 text-xs text-slate-600">
                  Lower numbers appear first on the homepage.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900"
                />
                <label className="text-sm font-semibold text-slate-900">Active</label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm sm:text-base font-bold text-white hover:bg-slate-800 transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Type"}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm sm:text-base font-bold text-slate-900 hover:bg-slate-100 transition disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white font-bold hover:bg-green-700 transition text-sm sm:text-base"
            >
              <AddIcon className="h-5 w-5 fill-current" />
              Add Type
            </button>
          </div>
        )}

        {/* Types List */}
        <div className="grid gap-4">
          {types.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
              No types yet. Add one to get started!
            </div>
          ) : (
            types.map((type) => (
              <div
                key={type.id}
                className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{type.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Slug: <code className="bg-slate-100 px-2 py-1 rounded">{type.slug}</code>
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          type.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {type.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-slate-600">Order: {type.sort_order}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(type.id)}
                      disabled={deleting === type.id}
                      className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200 transition disabled:opacity-60"
                      title="Delete type"
                    >
                      <DeleteBinIcon className="h-[18px] w-[18px] fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
