"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { useAppContext } from "@/app/context/AppContext";

export default function CalendarPage() {
  const { studySessions, fetchSchedule, loading, error } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchSchedule(currentMonth.toISOString()).catch(() => {});
  }, [currentMonth, fetchSchedule]);

  const groupedSessions = useMemo(() => {
    return studySessions.reduce((acc, session) => {
      if (!acc[session.date]) {
        acc[session.date] = [];
      }

      acc[session.date].push(session);
      return acc;
    }, {});
  }, [studySessions]);

  const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Study Calendar</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-200 hover:bg-slate-800"
            >
              Prev
            </button>
            <p className="min-w-40 text-center text-slate-200">{format(currentMonth, "MMMM yyyy")}</p>
            <button
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-200 hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wide text-slate-400">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name) => (
            <p key={name}>{name}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((date) => {
            const key = format(date, "yyyy-MM-dd");
            const sessionsForDay = groupedSessions[key] || [];
            const isCurrentMonth = isSameMonth(date, currentMonth);

            return (
              <div
                key={key}
                className={`min-h-28 rounded-xl border p-2 ${
                  isCurrentMonth
                    ? "border-slate-700 bg-slate-900/50"
                    : "border-slate-800 bg-slate-900/20"
                }`}
              >
                <p className={`text-sm ${isCurrentMonth ? "text-white" : "text-slate-500"}`}>
                  {format(date, "d")}
                </p>

                {sessionsForDay.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {sessionsForDay.slice(0, 2).map((session) => (
                      <div
                        key={session.id}
                        className={`rounded px-2 py-1 text-xs ${
                          session.status === "completed"
                            ? "bg-emerald-800/30 text-emerald-200"
                            : "bg-accent/20 text-indigo-200"
                        }`}
                      >
                        <div className="font-medium">{session.title}</div>
                        <div className="text-xs mt-0.5 opacity-75">
                          {session.duration ? `${session.duration}m` : ""}
                          {session.startTime ? ` · ${session.startTime}` : ""}
                        </div>
                        {(session.energy || session.distraction) && (
                          <div className="text-xs mt-0.5 opacity-60">
                            {session.energy && `⚡${session.energy}`}
                            {session.distraction && ` 🎯${session.distraction}`}
                          </div>
                        )}
                      </div>
                    ))}
                    {sessionsForDay.length > 2 ? (
                      <p className="text-xs text-slate-400">+{sessionsForDay.length - 2} more</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {loading ? <p className="mt-4 text-sm text-slate-300">Loading schedule...</p> : null}
        {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
      </div>
    </div>
  );
}
