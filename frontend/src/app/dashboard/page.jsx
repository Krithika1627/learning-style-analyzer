"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppContext } from "@/app/context/AppContext";

const CARDS = [
  { title: "Start Assessment", href: "/assessment/instructions", description: "Run or retake VARK assessment" },
  { title: "View Analysis", href: "/analysis", description: "See score distribution graph" },
  { title: "View Results", href: "/results", description: "Check dominant learning style" },
  { title: "Open Resources", href: "/resources", description: "Get personalized learning content" },
  { title: "Study Tracker", href: "/tracker", description: "Log today’s study sessions" },
  { title: "Calendar", href: "/calendar", description: "Review sessions by date" },
];

export default function DashboardPage() {
  const { learningStyle, studySessions } = useAppContext();

  const recentSessions = useMemo(() => {
    return [...studySessions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [studySessions]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-6 md:col-span-2">
          <p className="text-xs uppercase tracking-widest text-muted">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Learning Dashboard</h1>
          <p className="mt-3 text-slate-300">
            Current learning style: <span className="font-semibold text-white">{learningStyle || "Not determined"}</span>
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted">Sessions</p>
          <p className="mt-2 text-3xl font-semibold text-white">{studySessions.length}</p>
          <p className="text-slate-300">Total sessions logged</p>
        </section>
      </div>

      <section className="mb-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-white">Quick Navigation</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 transition hover:border-accent hover:bg-indigo-500/10"
            >
              <h3 className="text-base font-semibold text-white">{card.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-white">Recent Sessions</h2>
        {recentSessions.length === 0 ? (
          <p className="mt-3 text-slate-300">No study sessions available yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentSessions.map((session) => (
              <article key={session.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                <h3 className="text-base font-semibold text-white">{session.title}</h3>
                <p className="text-sm text-slate-300">{session.duration} minutes</p>
                <p className="text-sm text-slate-400">{session.date}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
