"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getSession, isAdmin } from "@/lib/auth";
import { getPhotographyTypes } from "@/lib/getPhotographyTypes";
import type { PhotographyType } from "@/lib/getPhotographyTypes";


type SlotStatus = "available" | "booked";
type ServiceTypeSlug = string;

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

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toHHMM(t: string) {
  return t.slice(0, 5);
}

export default function AdminAvailabilityPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [slots, setSlots] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<PhotographyType[]>([]);

  // Add form state
  const [type, setType] = useState<"time_slot" | "full_day">("time_slot");
  const [time, setTime] = useState<string>("10:00");
  const [status, setStatus] = useState<SlotStatus>("available");
  const [serviceType, setServiceType] = useState<ServiceTypeSlug | "">("");
  const [note, setNote] = useState<string>("");

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

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

  // Fetch slots whenever date changes
  useEffect(() => {
    if (checking) return;
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, checking]);

  useEffect(() => {
    if (checking) return;
    (async () => {
      const list = await getPhotographyTypes();
      setTypes(list);
    })();
  }, [checking]);

  const fetchSlots = async () => {
    setLoading(true);
    setErr(null);
    setMsg(null);

    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("date", selectedDate)
      .order("is_full_day", { ascending: false })
      .order("slot_time", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setSlots((data as AvailabilityRow[]) ?? []);
    setLoading(false);
  };

  const sortedSlots = useMemo(() => {
    return [...slots].sort((a, b) => {
      if (a.is_full_day !== b.is_full_day) return a.is_full_day ? -1 : 1;
      const ta = a.slot_time ?? "";
      const tb = b.slot_time ?? "";
      return ta.localeCompare(tb);
    });
  }, [slots]);

  const typeLabelMap = useMemo(() => {
    return new Map(types.map((t) => [t.slug, t.name]));
  }, [types]);

  const onAddSlot = async () => {
    setErr(null);
    setMsg(null);

    if (!selectedDate) {
      setErr("Please select a date.");
      return;
    }

    const payload: any = {
      date: selectedDate,
      status,
      service_type: serviceType || null,
      note: note.trim() || null,
    };

    if (type === "full_day") {
      payload.is_full_day = true;
      payload.slot_time = null;
    } else {
      payload.is_full_day = false;
      payload.slot_time = time; // "HH:MM" is fine
    }

    const { error } = await supabase.from("availability_slots").insert(payload);

    if (error) {
      // 23505 = unique violation in Postgres
      // Supabase often returns it as error.code
      if ((error as any).code === "23505") {
        setErr("This slot already exists for that date.");
        return;
      }
      setErr(error.message);
      return;
    }

    setMsg("Slot added ✅");
    setNote("");
    await fetchSlots();
  };

  const toggleStatus = async (row: AvailabilityRow) => {
    setErr(null);
    setMsg(null);

    const newStatus: SlotStatus = row.status === "available" ? "booked" : "available";

    const { error } = await supabase
      .from("availability_slots")
      .update({ status: newStatus })
      .eq("id", row.id);

    if (error) {
      setErr(error.message);
      return;
    }

    setSlots((prev) => prev.map((s) => (s.id === row.id ? { ...s, status: newStatus } : s)));
  };

  const deleteSlot = async (row: AvailabilityRow) => {
    const ok = confirm("Delete this slot?");
    if (!ok) return;

    setErr(null);
    setMsg(null);

    const { error } = await supabase.from("availability_slots").delete().eq("id", row.id);

    if (error) {
      setErr(error.message);
      return;
    }

    setSlots((prev) => prev.filter((s) => s.id !== row.id));
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
            <h1 className="text-2xl font-bold text-slate-900">Availability</h1>
            <p className="text-sm text-slate-700 mt-1">
              Add time slots or full-day availability, then mark booked when taken.
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
          {/* Left panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1">
            <label className="block text-sm font-bold text-slate-900">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
            />

            <div className="mt-6">
              <h2 className="text-sm font-bold text-slate-900">Add Slot</h2>

              <label className="mt-3 block text-sm font-bold text-slate-900">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="time_slot">Time slot</option>
                <option value="full_day">Full day</option>
              </select>

              {type === "time_slot" && (
                <>
                  <label className="mt-4 block text-sm font-bold text-slate-900">
                    Time (exact)
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </>
              )}

              <label className="mt-4 block text-sm font-bold text-slate-900">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SlotStatus)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>

              <label className="mt-4 block text-sm font-bold text-slate-900">
                Service type (optional)
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">(none)</option>
                {types.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>

              <label className="mt-4 block text-sm font-bold text-slate-900">
                Note (optional)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Evening only"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
              />

              <button
                onClick={onAddSlot}
                className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 text-white font-bold hover:bg-slate-800 transition"
              >
                Add Slot
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Slots on {selectedDate}</h2>
              <button
                onClick={fetchSlots}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="mt-4 text-slate-800 text-sm font-medium">Loading...</p>
            ) : sortedSlots.length === 0 ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-800 font-medium">
                No slots for this date yet. Add one on the left.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {sortedSlots.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-xl border border-slate-200 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-900">
                        {row.is_full_day ? "Full Day" : toHHMM(row.slot_time ?? "00:00:00")}
                      </span>

                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-bold ${
                          row.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {row.status.toUpperCase()}
                      </span>

                      {row.service_type && (
                        <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                          {typeLabelMap.get(row.service_type) ?? row.service_type.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <button
                        onClick={() => toggleStatus(row)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition"
                      >
                        Toggle status
                      </button>
                      <button
                        onClick={() => deleteSlot(row)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </div>

                    {row.note && (
                      <p className="text-sm text-slate-700 font-medium md:col-span-2">{row.note}</p>
                    )}
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
