"use client";

import FacebookCircleIcon from "@remixicons/react/line/FacebookCircleIcon";
import InstagramIcon from "@remixicons/react/line/InstagramIcon";
import TiktokIcon from "@remixicons/react/line/TiktokIcon";
import WhatsappIcon from "@remixicons/react/line/WhatsappIcon";
import type { SiteSettings } from "@/lib/getSettings";

interface InquirySectionProps {
  settings: SiteSettings | null;
}

export default function InquirySection({ settings }: InquirySectionProps) {
  const instagramUrl = settings?.instagram_url ?? "https://instagram.com/yourhandle";
  const facebookUrl = settings?.facebook_url ?? "https://facebook.com/yourpage";
  const tiktokUrl = settings?.tiktok_url ?? "https://tiktok.com/@yourhandle";

  const whatsappDigits = (settings?.whatsapp_number ?? "").replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    `Hi ${settings?.brand_name || "Raygraphy"}! I have a question about your photography services.`
  );
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${whatsappMessage}`
    : "#";

  return (
    <section id="inquiry" className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
          Stay Connected
        </h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          Follow us on social media for updates, behind-the-scenes moments, and new releases.
        </p>

        <div className="grid md:grid-cols-4 gap-6">
          {/* WhatsApp */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 text-center border border-green-200 flex flex-col">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <WhatsappIcon className="h-8 w-8 text-white fill-current" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">WhatsApp</h3>
            <p className="text-slate-600 text-sm mb-4">
              Ask a question or request a custom quote.
            </p>
            {whatsappDigits ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition text-sm"
              >
                Message us
              </a>
            ) : (
              <span className="mt-auto inline-block bg-green-200 text-green-900 px-6 py-3 rounded-lg font-semibold text-sm cursor-not-allowed">
                Message us
              </span>
            )}

            {!whatsappDigits && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                WhatsApp number not configured in Admin Settings.
              </p>
            )}
          </div>

          {/* Instagram */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-100 rounded-lg p-8 text-center border border-pink-200 flex flex-col">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <InstagramIcon className="h-8 w-8 text-white fill-current" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Instagram</h3>
            <p className="text-slate-600 text-sm mb-4">
              See our latest portfolio and behind-the-scenes
            </p>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition text-sm"
            >
              Follow us
            </a>
          </div>

          {/* TikTok */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-8 text-center border border-slate-300 flex flex-col">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <TiktokIcon className="h-8 w-8 text-white fill-current" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">TikTok</h3>
            <p className="text-slate-600 text-sm mb-4">Watch our creative video content and reels</p>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-block bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition text-sm"
            >
              Check videos
            </a>
          </div>

          {/* Facebook */}
          <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg p-8 text-center border border-blue-200 flex flex-col">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FacebookCircleIcon className="h-8 w-8 text-white fill-current" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Facebook</h3>
            <p className="text-slate-600 text-sm mb-4">
              Updates, announcements, and client highlights
            </p>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
            >
              Visit page
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
          <p className="text-slate-600 text-sm">Thank you!</p>
        </div>
      </div>
    </section>
  );
}
