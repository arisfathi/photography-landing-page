"use client";

import { Instagram, MessageCircle, Music } from "lucide-react";
import type { SiteSettings } from "@/lib/getSettings";

interface InquirySectionProps {
  selectedDate?: string;
  selectedTime?: string;
  settings: SiteSettings | null;
}

export default function InquirySection({
  selectedDate,
  selectedTime,
  settings,
}: InquirySectionProps) {
  const whatsappNumber = settings?.whatsapp_number ?? "60123456789"; // wa.me needs no '+'
  const instagramUrl = settings?.instagram_url ?? "https://instagram.com/yourhandle";
  const tiktokUrl = settings?.tiktok_url ?? "https://tiktok.com/@yourhandle";

  const buildWhatsAppMessage = () => {
    let message = "Hi Raygraphy! 👋\n\n";
    message += "I'm interested in your photography services.\n\n";

    if (selectedDate && selectedTime) {
      message += `📅 Preferred Date: ${new Date(selectedDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}\n`;
      message += `⏰ Preferred Time: ${selectedTime}\n\n`;
    }

    message += "Please let me know about availability and next steps.\n\nThank you!";
    return encodeURIComponent(message);
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${buildWhatsAppMessage()}`;

  // For display only (nice formatting). If admin stores +60... we keep it; otherwise show +<number>
  const displayWhatsapp =
    settings?.whatsapp_number
      ? (settings.whatsapp_number.startsWith("+") ? settings.whatsapp_number : `+${settings.whatsapp_number}`)
      : "+60123456789";

  return (
    <section id="inquiry" className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
          Ready to Book?
        </h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          Have questions or want to schedule your session? Reach out to us on WhatsApp or follow
          us on social media for updates and inspiration.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* WhatsApp CTA */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 text-center border border-green-200">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">WhatsApp</h3>
            <p className="text-slate-600 text-sm mb-4">
              Quick response & instant booking confirmation
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition text-sm"
            >
              Message us
            </a>
            {selectedDate && selectedTime && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-green-200 text-left">
                <p className="text-xs text-green-700 font-semibold">
                  ✓ Your slot info is included in the message
                </p>
              </div>
            )}
          </div>

          {/* Instagram */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-100 rounded-lg p-8 text-center border border-pink-200">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Instagram size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Instagram</h3>
            <p className="text-slate-600 text-sm mb-4">
              See our latest portfolio & behind-the-scenes
            </p>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition text-sm"
            >
              Follow us
            </a>
          </div>

          {/* TikTok */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-8 text-center border border-slate-300">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">TikTok</h3>
            <p className="text-slate-600 text-sm mb-4">Watch our creative video content & reels</p>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition text-sm"
            >
              Check videos
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
          <p className="text-slate-600 text-sm">
            Direct WhatsApp: <span className="font-semibold text-slate-900">{displayWhatsapp}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
