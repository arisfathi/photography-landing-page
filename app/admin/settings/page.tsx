"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getSession, isAdmin } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { uploadToStorage } from "@/lib/storage";

type SettingsForm = {
  brand_name: string;
  brand_domain: string;
  logo_url: string;
  contact_phone: string;
  whatsapp_number: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  hero_banner_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_tagline: string;
};

const emptyForm: SettingsForm = {
  brand_name: "",
  brand_domain: "",
  logo_url: "",
  contact_phone: "",
  whatsapp_number: "",
  instagram_url: "",
  facebook_url: "",
  tiktok_url: "",
  hero_banner_url: "",
  hero_title: "",
  hero_subtitle: "",
  hero_tagline: "",
};

export default function AdminSettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logoVersion, setLogoVersion] = useState<string>("");

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
      facebook_url: data.facebook_url ?? "",
      tiktok_url: data.tiktok_url ?? "",
      hero_banner_url: data.hero_banner_url ?? "",
      hero_title: data.hero_title ?? "",
      hero_subtitle: data.hero_subtitle ?? "",
      hero_tagline: data.hero_tagline ?? "",
    });
    setLogoVersion(data.updated_at ?? "");

    setLoading(false);
  };

  const updateField = (key: keyof SettingsForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onUploadLogo = async (file: File) => {
    setUploadingLogo(true);
    setErrorMsg(null);
    setMessage(null);

    const result = await uploadToStorage("site-assets", "logo", file);
    if (result) {
      updateField("logo_url", result.url);
      setMessage("Logo uploaded! Click Save to confirm.");
    } else {
      setErrorMsg("Logo upload failed. Make sure 'site-assets' bucket exists.");
    }

    setUploadingLogo(false);
  };

  const onUploadBanner = async (file: File) => {
    setUploadingBanner(true);
    setErrorMsg(null);
    setMessage(null);

    const result = await uploadToStorage("site-assets", "hero", file);
    if (result) {
      updateField("hero_banner_url", result.url);
      setMessage("Banner uploaded! Click Save to confirm.");
    } else {
      setErrorMsg("Banner upload failed. Make sure 'site-assets' bucket exists.");
    }

    setUploadingBanner(false);
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
      facebook_url: form.facebook_url.trim() || null,
      tiktok_url: form.tiktok_url.trim() || null,
      hero_banner_url: form.hero_banner_url.trim() || null,
      hero_title: form.hero_title.trim() || null,
      hero_subtitle: form.hero_subtitle.trim() || null,
      hero_tagline: form.hero_tagline.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);

    if (error) {
      setErrorMsg(error.message);
      setSaving(false);
      return;
    }

    setLogoVersion(payload.updated_at);
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
    <main className="min-h-screen bg-slate-50 px-3 sm:px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-700 mt-1">
              Update brand, hero, logo, and social media.
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

        <div className="space-y-6">
          {/* Brand Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Brand Settings</h2>
            <div className="space-y-4">
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
            </div>
          </div>

          {/* Logo Upload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Logo</h2>
            <div className="space-y-4">
              {form.logo_url && (
                <div className="rounded-lg overflow-hidden bg-slate-50 p-4">
                  <img
                    src={`${form.logo_url}${logoVersion ? `?v=${encodeURIComponent(logoVersion)}` : ""}`}
                    alt="Logo preview"
                    className="h-20 object-contain"
                  />
                </div>
              )}
              {form.logo_url && (
                <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={`${form.logo_url}${logoVersion ? `?v=${encodeURIComponent(logoVersion)}` : ""}`}
                      alt="Favicon preview"
                      className="h-8 w-8 rounded"
                    />
                    <div className="text-xs text-slate-600">
                      Favicon preview (browser tab)
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Tip: refresh the browser if the icon looks cached.
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Upload Logo Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) onUploadLogo(file);
                  }}
                  disabled={uploadingLogo}
                  className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 disabled:opacity-60"
                />
              </div>
              <Field
                label="Logo URL (manual paste)"
                value={form.logo_url}
                onChange={(v) => updateField("logo_url", v)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Hero Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Hero Section</h2>
            <div className="space-y-4">
              {form.hero_banner_url && (
                <div className="rounded-lg overflow-hidden bg-slate-50">
                  <img
                    src={form.hero_banner_url}
                    alt="Banner preview"
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Upload Hero Banner Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) onUploadBanner(file);
                  }}
                  disabled={uploadingBanner}
                  className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 disabled:opacity-60"
                />
                <p className="mt-2 text-xs text-slate-600">
                  If empty, will show gradient hero instead.
                </p>
              </div>

              <Field
                label="Hero Title"
                value={form.hero_title}
                onChange={(v) => updateField("hero_title", v)}
                placeholder="Professional Photography"
              />

              <Field
                label="Hero Subtitle"
                value={form.hero_subtitle}
                onChange={(v) => updateField("hero_subtitle", v)}
                placeholder="Capturing moments, creating memories"
              />

              <Field
                label="Hero Tagline / Description"
                value={form.hero_tagline}
                onChange={(v) => updateField("hero_tagline", v)}
                placeholder="Convocation, wedding, and event photography..."
                isTextarea
              />
            </div>
          </div>

          {/* Contact & Social */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
              Contact & Social Media
            </h2>
            <div className="space-y-4">
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
                label="Facebook URL"
                value={form.facebook_url}
                onChange={(v) => updateField("facebook_url", v)}
                placeholder="https://facebook.com/yourpage"
              />

              <Field
                label="TikTok URL"
                value={form.tiktok_url}
                onChange={(v) => updateField("tiktok_url", v)}
                placeholder="https://tiktok.com/@yourhandle"
              />
            </div>
          </div>

          {/* Save Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-lg bg-slate-900 px-4 sm:px-6 py-3 text-white font-bold hover:bg-slate-800 transition disabled:opacity-60 text-sm sm:text-base"
            >
              {saving ? "Saving..." : "Save All Settings"}
            </button>

            <button
              onClick={loadSettings}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-4 sm:px-6 py-3 text-slate-900 font-bold hover:bg-slate-100 transition disabled:opacity-60 text-sm sm:text-base"
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
  isTextarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-900">{props.label}</label>
      {props.helper && (
        <p className="mt-1 text-xs sm:text-sm text-slate-700 font-medium">{props.helper}</p>
      )}
      {props.isTextarea ? (
        <textarea
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          rows={3}
        />
      ) : (
        <input
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
        />
      )}
    </div>
  );
}
