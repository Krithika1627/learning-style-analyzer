"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useAppContext } from "@/app/context/AppContext";

const quickLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assessment/instructions", label: "Assessment" },
  { href: "/analysis", label: "Analysis" },
  { href: "/results", label: "Results" },
  { href: "/resources", label: "Resources" },
  { href: "/tracker", label: "Tracker" },
  { href: "/calendar", label: "Calendar" },
];

export default function Profile() {
  const { user } = useUser();
  const { learningStyle, studySessions } = useAppContext();

  const recentSessions = useMemo(() => {
    return [...studySessions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [studySessions]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={user.imageUrl}
              alt={user.fullName || "User profile"}
              width={72}
              height={72}
              className="h-18 w-18 rounded-full border border-slate-600"
            />

            <div>
              <h1 className="text-2xl font-semibold text-white">{user.fullName || "Profile"}</h1>
              <p className="text-sm text-slate-300">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <SignOutButton>
            <button className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500">
              Logout
            </button>
          </SignOutButton>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted">Learning Style</p>
          <p className="mt-2 text-xl font-semibold text-white">{learningStyle || "Pending"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted">Sessions Logged</p>
          <p className="mt-2 text-xl font-semibold text-white">{studySessions.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted">Assessment</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {learningStyle ? "Completed" : "Not Attempted"}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-white">Quick Navigation</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
        {recentSessions.length === 0 ? (
          <p className="mt-3 text-slate-300">No study sessions yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {recentSessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                <p className="font-medium text-white">{session.title}</p>
                <p className="text-sm text-slate-300">{session.duration} min</p>
                <p className="text-sm text-slate-400">{session.date}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
