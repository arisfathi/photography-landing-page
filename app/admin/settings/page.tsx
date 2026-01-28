"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getSession, isAdmin } from "@/lib/auth";
import { useRouter } from "next/navigation";

type SettingsForm = {
  brand_name: string;
  brand_domain: string;
  logo_url: string;
  contact_phone: string;
  whatsapp_number: string;
  instagram_url: string;
  tiktok_url: string;
};

const emptyForm: SettingsForm = {
  brand_name: "",
  brand_domain: "",
  logo_url: "",
  contact_phone: "",
  whatsapp_number: "",
  instagram_url: "",
  tiktok_url: "",
};

export default function AdminSettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<SettingsForm>(emptyForm);

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

      await loadSettings();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg(null);
    setMessage(null);

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setForm({
      brand_name: data.brand_name ?? "",
      brand_domain: data.brand_domain ?? "",
      logo_url: data.logo_url ?? "",
      contact_phone: data.contact_phone ?? "",
      whatsapp_number: data.whatsapp_number ?? "",
      instagram_url: data.instagram_url ?? "",
      tiktok_url: data.tiktok_url ?? "",
    });

    setLoading(false);
  };

  const updateField = (key: keyof SettingsForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    setMessage(null);

    const payload = {
      brand_name: form.brand_name.trim(),
      brand_domain: form.brand_domain.trim() || null,
      logo_url: form.logo_url.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      whatsapp_number: form.whatsapp_number.trim() || null,
      instagram_url: form.instagram_url.trim() || null,
      tiktok_url: form.tiktok_url.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);

    if (error) {
      setErrorMsg(error.message);
      setSaving(false);
      return;
    }

    setMessage("Saved successfully ✅");
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl text-slate-800 font-medium">
          Loading settings...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-700 mt-1">
              Update your brand name, contact links, and social media.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
          >
            Back
          </button>
        </div>

        {(message || errorMsg) && (
          <div
            className={`mt-6 rounded-lg border p-3 text-sm font-medium ${
              errorMsg
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            {errorMsg ?? message}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <Field
            label="Brand Name"
            value={form.brand_name}
            onChange={(v) => updateField("brand_name", v)}
            placeholder="Raygraphy"
          />

          <Field
            label="Brand Domain (optional)"
            value={form.brand_domain}
            onChange={(v) => updateField("brand_domain", v)}
            placeholder="raygraphy.co"
          />

          <Field
            label="Logo URL (optional)"
            value={form.logo_url}
            onChange={(v) => updateField("logo_url", v)}
            placeholder="https://..."
          />

          <Field
            label="Contact Phone (tel: link) (optional)"
            value={form.contact_phone}
            onChange={(v) => updateField("contact_phone", v)}
            placeholder="+60123456789"
          />

          <Field
            label="WhatsApp Number (wa.me) (no +)"
            value={form.whatsapp_number}
            onChange={(v) => updateField("whatsapp_number", v)}
            placeholder="60123456789"
            helper="Example: 60123456789 (no plus sign)."
          />

          <Field
            label="Instagram URL"
            value={form.instagram_url}
            onChange={(v) => updateField("instagram_url", v)}
            placeholder="https://instagram.com/yourhandle"
          />

          <Field
            label="TikTok URL"
            value={form.tiktok_url}
            onChange={(v) => updateField("tiktok_url", v)}
            placeholder="https://tiktok.com/@yourhandle"
          />

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-lg bg-slate-900 px-5 py-3 text-white font-bold hover:bg-slate-800 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>

            <button
              onClick={loadSettings}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-slate-900 font-bold hover:bg-slate-100 transition disabled:opacity-60"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-900">{props.label}</label>
      {props.helper && (
        <p className="mt-1 text-sm text-slate-700 font-medium">{props.helper}</p>
      )}
      <input
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
      />
    </div>
  );
}
