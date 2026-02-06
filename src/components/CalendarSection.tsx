"use client";

import { useEffect, useMemo, useState } from "react";
import ArrowLeftSIcon from "@remixicons/react/line/ArrowLeftSIcon";
import ArrowRightSIcon from "@remixicons/react/line/ArrowRightSIcon";
import { supabase } from "@/lib/supabaseClient";
import type { SiteSettings } from "@/lib/getSettings";
import type { SelectedPackage } from "@/lib/bookingTypes";

type SlotStatus = "available" | "booked";
type ServiceTypeSlug = string;
type AvailabilitySlot = { time: string; status: SlotStatus };

type AvailabilityRow = {
  id: string;
  date: string; // YYYY-MM-DD
  slot_time: string | null; // HH:MM:SS or null
  is_full_day: boolean;
  service_type: ServiceTypeSlug | null;
  status: SlotStatus;
  note: string | null;
  created_at: string;
};

interface CalendarSectionProps {
  onDateSelect: (date: string, time: string) => void; // keep as-is, we pass "Any Time"
  selectedDate?: string;
  selectedTime?: string; // not used anymore, but keep to avoid breaking parent
  selectedPackage?: SelectedPackage | null;
  selectedTypeLabel?: string | null;
  settings: SiteSettings | null;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatDate = (year: number, month: number, day: number): string => {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
};

const monthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const getDaysInMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getFirstDayOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1).getDay();

const toHHMM = (t: string) => t.slice(0, 5);

export default function CalendarSection({
  onDateSelect,
  selectedDate,
  selectedPackage,
  selectedTypeLabel,
  settings,
}: CalendarSectionProps) {
  const [currentDate, setCurrentDate] = useState(new Date()); // current month
  const [selectedDay, setSelectedDay] = useState<string | null>(selectedDate || null);

  const [rows, setRows] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // keep UI synced if parent changes selectedDate
  useEffect(() => {
    if (selectedDate) setSelectedDay(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setBookingError(null);
  }, [selectedPackage, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDay(dateStr);

    // DATE ONLY: always proceed with "Any Time"
    onDateSelect(dateStr, "Any Time");
  };

  // Fetch availability for current month from Supabase
  useEffect(() => {
    fetchMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  const fetchMonth = async () => {
    setLoading(true);
    setErr(null);

    const from = formatDate(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const to = formatDate(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      getDaysInMonth(currentDate)
    );

    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true })
      .order("is_full_day", { ascending: false })
      .order("slot_time", { ascending: true });

    if (error) {
      setErr(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data as AvailabilityRow[]) ?? []);
    setLoading(false);
  };

  // Group rows by date
  const byDate = useMemo(() => {
    const map = new Map<string, AvailabilityRow[]>();
    for (const r of rows) {
      const list = map.get(r.date) ?? [];
      list.push(r);
      map.set(r.date, list);
    }
    return map;
  }, [rows]);

  // Full-day booked => date becomes RED, but still clickable
  const isFullDayBooked = (dateStr: string) => {
    const list = byDate.get(dateStr) ?? [];
    return list.some((x) => x.is_full_day && x.status === "booked");
  };

  // For selected date: show ONLY slots that admin created (view-only)
  const getAvailabilityForDate = (dateStr: string): { slots: AvailabilitySlot[]; eventType: ServiceTypeSlug | null } => {
    const list = byDate.get(dateStr) ?? [];

    const slots: AvailabilitySlot[] = list
      .slice()
      .sort((a, b) => {
        if (a.is_full_day !== b.is_full_day) return a.is_full_day ? -1 : 1;
        const ta = a.slot_time ?? "";
        const tb = b.slot_time ?? "";
        return ta.localeCompare(tb);
      })
      .map((x) => ({
        time: x.is_full_day ? "Full Day" : toHHMM(x.slot_time ?? "00:00:00"),
        status: x.status,
      }));

    const eventType = list.find((x) => x.service_type)?.service_type ?? null;

    return { slots, eventType };
  };

  const availability = selectedDay ? getAvailabilityForDate(selectedDay) : null;
  const selectedDayIsFullBooked = selectedDay ? isFullDayBooked(selectedDay) : false;
  const effectiveDate = selectedDay ?? selectedDate ?? null;
  const brandName = settings?.brand_name || "Raygraphy";
  const whatsappDigits = (settings?.whatsapp_number ?? "").replace(/\D/g, "");
  const contactDigits = (settings?.contact_phone ?? "").replace(/\D/g, "");
  const phoneDigits = whatsappDigits || contactDigits;

  const days: Array<number | null> = [];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = monthLabel(currentDate);

  const formatNiceDate = (iso: string) => {
    const safeDate = new Date(`${iso}T00:00:00`);
    return safeDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const buildWhatsAppMessage = () => {
    if (!selectedPackage || !effectiveDate) return "";
    const lines = [
      `Hi ${brandName}!`,
      "",
      "I'd like to book a session with these details:",
      `Category: ${selectedTypeLabel || "Photography"}`,
      `Package: ${selectedPackage.name}`,      
      `Date: ${formatNiceDate(effectiveDate)}`,
      "Time: ",
      "Pax: ",
      "",
      "Please confirm availability. Thank you!",
    ].filter(Boolean);

    return encodeURIComponent(lines.join("\n"));
  };

  const handleBookNow = () => {
    if (!selectedPackage || !effectiveDate) return;
    if (!phoneDigits) {
      setBookingError("WhatsApp number is not configured. Please use the inquiry section below.");
      const inquiryEl = document.getElementById("inquiry");
      if (inquiryEl) inquiryEl.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const url = `https://wa.me/${phoneDigits}?text=${buildWhatsAppMessage()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const canBook = Boolean(selectedPackage && effectiveDate);

  return (
    <section
      id="calendar"
      className="py-10 sm:py-12 px-3 sm:px-4 bg-slate-50 overflow-x-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
          Check Availability
        </h2>
        
        <p className="text-slate-700 text-center mb-12 max-w-2xl mx-auto font-medium">
          Select a date to check availability and confirm your booking details.
        </p>

        {err && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 font-medium">
            {err}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 sm:p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <button
                onClick={handlePrevMonth}
                className="p-2 sm:p-3 hover:bg-slate-100 rounded-lg transition"
                aria-label="Previous month"
              >
                <ArrowLeftSIcon className="h-5 w-5 text-slate-900 fill-current" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 text-center">
                  {monthName}
                </h3>
                <button
                  onClick={fetchMonth}
                  className="text-xs font-bold rounded-lg border border-slate-200 px-2 py-1 sm:px-3 sm:py-2 hover:bg-slate-50 transition"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 sm:p-3 hover:bg-slate-100 rounded-lg transition"
                aria-label="Next month"
              >
                <ArrowRightSIcon className="h-5 w-5 text-slate-900 fill-current" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs sm:text-sm font-semibold text-slate-600"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {days.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;

                const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
                const fullBooked = isFullDayBooked(dateStr);
                const isSelected = selectedDay === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleSelectDay(day)}
                    className={`
                      aspect-square rounded-lg font-semibold transition text-xs sm:text-sm
                      ${
                        isSelected
                          ? "bg-slate-900 text-white ring-2 ring-slate-900"
                          : fullBooked
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : "bg-green-100 text-green-900 hover:bg-green-200"
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots Display (view-only) */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
              {selectedDay ? "Availability Details" : "Select a Date"}
            </h3>

            {selectedDay && availability ? (
              availability.slots.length > 0 ? (
                <div className="space-y-2">
                  {availability.slots.map((slot: AvailabilitySlot, idx: number) => {
                    const effectiveBooked = selectedDayIsFullBooked || slot.status === "booked";

                    return (
                      <div
                        key={idx}
                        className={`
                          w-full py-3 px-4 rounded-lg font-medium text-sm border
                          ${
                            !effectiveBooked
                              ? "bg-green-50 text-green-900 border-green-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span>{slot.time}</span>
                          <span className="text-xs font-semibold">
                            {!effectiveBooked ? "Available" : "Booked"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">
                  No slots for this date yet. You can still proceed with booking using the selected date.</p>
              )
            ) : (
              <p className="text-slate-500 text-sm">
                Green = available. Red = fully booked.
              </p>
            )}

            {/* Booking Summary */}
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">
                Booking Summary
              </h4>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Category</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {selectedTypeLabel || "Select a package"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Package</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {selectedPackage?.name || "Select a package"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Date</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {effectiveDate ? formatNiceDate(effectiveDate) : "Pick a date"}
                    </span>
                  </div>
                </div>

                {selectedPackage?.features.length ? (
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 font-semibold mb-2">Key features</p>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {selectedPackage.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {bookingError && (
                  <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    {bookingError}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleBookNow}
                disabled={!canBook}
                className={`mt-4 w-full rounded-lg px-4 py-3 text-sm font-bold transition ${
                  canBook
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                Book now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


