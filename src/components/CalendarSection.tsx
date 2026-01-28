"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type SlotStatus = "available" | "booked";
type ServiceType = "portrait" | "event" | "wedding";

type AvailabilityRow = {
  id: string;
  date: string; // YYYY-MM-DD
  slot_time: string | null; // HH:MM:SS or null
  is_full_day: boolean;
  service_type: ServiceType | null;
  status: SlotStatus;
  note: string | null;
  created_at: string;
};

interface CalendarSectionProps {
  onDateSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatDate = (year: number, month: number, day: number): string => {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
};

const monthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

const toHHMM = (t: string) => t.slice(0, 5);

export default function CalendarSection({
  onDateSelect,
  selectedDate,
  selectedTime,
}: CalendarSectionProps) {
  const [currentDate, setCurrentDate] = useState(new Date()); // current month
  const [selectedDay, setSelectedDay] = useState<string | null>(selectedDate || null);

  const [rows, setRows] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // keep UI synced if parent changes selectedDate
  useEffect(() => {
    if (selectedDate) setSelectedDay(selectedDate);
  }, [selectedDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDay(dateStr);
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
    const to = formatDate(currentDate.getFullYear(), currentDate.getMonth(), getDaysInMonth(currentDate));

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

  // UI: green dates that have at least 1 available slot
  const hasAvailableSlot = (dateStr: string) => {
    const list = byDate.get(dateStr) ?? [];
    return list.some((x) => x.status === "available");
  };

  // UI: get availability object for selected date (like your mock)
  const getAvailabilityForDate = (dateStr: string) => {
    const list = byDate.get(dateStr) ?? [];
    if (list.length === 0) return null;

    // Build slots array similar to your mock structure
    const slots = list
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

    // optional event type (use first non-null service_type)
    const eventType = list.find((x) => x.service_type)?.service_type ?? null;

    return { slots, eventType };
  };

  const availability = selectedDay ? getAvailabilityForDate(selectedDay) : null;

  const days: Array<number | null> = [];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = monthLabel(currentDate);

  return (
    <section id="calendar" className="py-12 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Check Availability</h2>

        {err && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 font-medium">
            {err}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                className="p-10 hover:bg-slate-900 rounded-lg transition"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5 text-slate-900" strokeWidth={2.5} />

              </button>

              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{monthName}</h3>
                <button
                  onClick={fetchMonth}
                  className="text-xs font-bold rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 transition"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-10 hover:bg-slate-900 rounded-lg transition"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-slate-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;

                const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
                const available = hasAvailableSlot(dateStr);
                const isSelected = selectedDay === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleSelectDay(day)}
                    className={`
                      aspect-square rounded-lg font-semibold transition text-sm
                      ${
                        isSelected
                          ? "bg-slate-900 text-white ring-2 ring-slate-900"
                          : available
                          ? "bg-green-100 text-green-900 hover:bg-green-200"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }
                    `}
                    disabled={!available}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots Display */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {selectedDay ? "Available Slots" : "Select a Date"}
            </h3>

            {selectedDay && availability ? (
              <div className="space-y-2">
                {availability.slots.map((slot: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => onDateSelect(selectedDay, slot.time)}
                    disabled={slot.status === "booked"}
                    className={`
                      w-full py-3 px-4 rounded-lg font-medium transition text-sm
                      ${
                        selectedTime === slot.time && slot.status === "available"
                          ? "bg-slate-900 text-white"
                          : slot.status === "available"
                          ? "bg-green-50 text-green-900 hover:bg-green-100 border border-green-200"
                          : "bg-red-50 text-red-600 cursor-not-allowed border border-red-200"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{slot.time}</span>
                      <span className="text-xs font-semibold">
                        {slot.status === "available" ? "✓ Available" : "✗ Booked"}
                      </span>
                    </div>
                  </button>
                ))}

              </div>
            ) : (
              <p className="text-slate-500 text-sm">
                Green dates have available slots
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
