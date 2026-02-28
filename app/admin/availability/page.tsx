"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowLeftSIcon from "@remixicons/react/line/ArrowLeftSIcon";
import ArrowRightSIcon from "@remixicons/react/line/ArrowRightSIcon";
import { supabase } from "@/lib/supabaseClient";
import { getSession, isAdmin } from "@/lib/auth";

type BookedDayRow = {
  id: string;
  date: string; // YYYY-MM-DD
  note: string | null;
  updated_at: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatDate = (year: number, month: number, day: number): string =>
  `${year}-${pad2(month + 1)}-${pad2(day)}`;

const monthKeyFromDate = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;

const monthKeyFromIso = (iso: string): string => iso.slice(0, 7);

const monthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const getDaysInMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getFirstDayOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1).getDay();

const toSortedUnique = (dates: string[]) => Array.from(new Set(dates)).sort();

const replaceMonthDates = (
  prev: string[],
  key: string,
  incoming: string[]
): string[] => {
  const kept = prev.filter((d) => monthKeyFromIso(d) !== key);
  return toSortedUnique([...kept, ...incoming]);
};

const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export default function AdminAvailabilityPage() {
  const router = useRouter();
  const loadedMonthKeysRef = useRef<Set<string>>(new Set());

  const [checking, setChecking] = useState(true);
  const [currentDate, setCurrentDate] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const [serverBookedDates, setServerBookedDates] = useState<string[]>([]);
  const [localBookedDates, setLocalBookedDates] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const monthKey = monthKeyFromDate(currentDate);

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

  useEffect(() => {
    if (checking) return;
    fetchMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking, currentDate.getFullYear(), currentDate.getMonth()]);

  const fetchMonth = async (options?: { forceSyncLocalForMonth?: boolean }) => {
    setLoading(true);
    setErr(null);
    setMsg(null);

    const from = formatDate(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const to = formatDate(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      getDaysInMonth(currentDate)
    );
    const targetMonthKey = monthKeyFromDate(currentDate);

    const { data, error } = await supabase
      .from("booked_days")
      .select("id, date, note, updated_at")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    const monthDates = ((data as BookedDayRow[]) ?? []).map((row) => row.date);
    setServerBookedDates((prev) => replaceMonthDates(prev, targetMonthKey, monthDates));

    const monthLoaded = loadedMonthKeysRef.current.has(targetMonthKey);
    if (!monthLoaded || options?.forceSyncLocalForMonth) {
      setLocalBookedDates((prev) =>
        replaceMonthDates(prev, targetMonthKey, monthDates)
      );
    }
    loadedMonthKeysRef.current.add(targetMonthKey);
    setLoading(false);
  };

  const localBookedSet = useMemo(() => new Set(localBookedDates), [localBookedDates]);
  const serverBookedSet = useMemo(() => new Set(serverBookedDates), [serverBookedDates]);
  const isDirty = useMemo(
    () => !arraysEqual(localBookedDates, serverBookedDates),
    [localBookedDates, serverBookedDates]
  );

  const monthBookedCount = useMemo(
    () => localBookedDates.filter((d) => monthKeyFromIso(d) === monthKey).length,
    [localBookedDates, monthKey]
  );

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleToggleDate = (day: number) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDay(dateStr);
    setErr(null);
    setMsg(null);

    setLocalBookedDates((prev) => {
      if (prev.includes(dateStr)) return prev.filter((d) => d !== dateStr);
      return toSortedUnique([...prev, dateStr]);
    });
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setErr(null);
    setMsg(null);

    const added = localBookedDates.filter((d) => !serverBookedSet.has(d));
    const removed = serverBookedDates.filter((d) => !localBookedSet.has(d));

    if (added.length === 0 && removed.length === 0) {
      setMsg("No changes to save.");
      setSaving(false);
      return;
    }

    if (added.length > 0) {
      const now = new Date().toISOString();
      const payload = added.map((date) => ({
        date,
        note: null as string | null,
        updated_at: now,
      }));
      const { error } = await supabase
        .from("booked_days")
        .upsert(payload, { onConflict: "date" });

      if (error) {
        setErr(error.message);
        setSaving(false);
        return;
      }
    }

    if (removed.length > 0) {
      const { error } = await supabase.from("booked_days").delete().in("date", removed);
      if (error) {
        setErr(error.message);
        setSaving(false);
        return;
      }
    }

    setServerBookedDates(localBookedDates);
    setMsg("Availability updated successfully.");
    setSaving(false);
  };

  const handleDiscardMonthChanges = () => {
    setErr(null);
    setMsg(null);
    fetchMonth({ forceSyncLocalForMonth: true });
  };

  const days: Array<number | null> = [];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  for (let i = 0; i < firstDay; i += 1) days.push(null);
  for (let i = 1; i <= daysInMonth; i += 1) days.push(i);

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-6xl text-slate-800 font-medium">
          Checking admin access...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Availability</h1>
            <p className="text-sm text-slate-700 mt-1">
              Default is available for all dates. Click a day to mark it booked.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
          >
            Back
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isDirty
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-green-100 text-green-800 border border-green-200"
            }`}
          >
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </span>

          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            Booked days this month: {monthBookedCount}
          </span>
        </div>

        {(msg || err) && (
          <div
            className={`mt-5 rounded-lg border p-3 text-sm font-medium ${
              err
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            {err ?? msg}
          </div>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={handlePrevMonth}
                className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50 transition"
                aria-label="Previous month"
              >
                <ArrowLeftSIcon className="h-5 w-5 text-slate-900 fill-current" />
              </button>

              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {monthLabel(currentDate)}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Green = available, Red = booked
                </p>
              </div>

              <button
                onClick={handleNextMonth}
                className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50 transition"
                aria-label="Next month"
              >
                <ArrowRightSIcon className="h-5 w-5 text-slate-900 fill-current" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs sm:text-sm font-semibold text-slate-600"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;

                const dateStr = formatDate(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day
                );
                const isBooked = localBookedSet.has(dateStr);
                const isSelected = selectedDay === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleToggleDate(day)}
                    className={`aspect-square rounded-lg text-sm sm:text-base font-bold transition border ${
                      isSelected
                        ? "ring-2 ring-slate-900"
                        : ""
                    } ${
                      isBooked
                        ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                        : "bg-green-100 text-green-900 border-green-200 hover:bg-green-200"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <h3 className="text-base font-bold text-slate-900 mb-3">Actions</h3>

            <div className="space-y-2 text-sm text-slate-700">
              <p>
                Default state is <span className="font-semibold text-green-700">available</span>.
              </p>
              <p>
                Only <span className="font-semibold text-red-700">booked</span> dates are saved
                in database.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <button
                onClick={handleSaveChanges}
                disabled={!isDirty || saving}
                className={`w-full rounded-lg px-4 py-3 text-sm font-bold transition ${
                  !isDirty || saving
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                onClick={handleDiscardMonthChanges}
                disabled={loading || saving}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 transition disabled:opacity-60"
              >
                Discard month changes
              </button>

              <button
                onClick={() => fetchMonth({ forceSyncLocalForMonth: true })}
                disabled={loading || saving}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 transition disabled:opacity-60"
              >
                {loading ? "Loading..." : "Refresh month"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

