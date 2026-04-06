"use client";

import Link from "next/link";
import { useAppContext } from "@/app/context/AppContext";

const STYLE_DESCRIPTIONS = {
  Visual:
    "You learn best with diagrams, charts, and visual structures that help you map ideas quickly.",
  Auditory:
    "You retain information effectively through listening, discussion, and verbal explanation.",
  "Read/Write":
    "You understand topics deeply by reading detailed material and rewriting concepts in your own words.",
  Kinesthetic:
    "You master concepts through hands-on practice, experiments, and real-world application.",
};

export default function ResultsPage() {
  const { learningStyle, result } = useAppContext();

  const safeStyle = learningStyle || "Visual";
  const score = Number(result?.[safeStyle] ?? 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-lg shadow-black/20">
        <p className="text-xs uppercase tracking-widest text-muted">Assessment Outcome</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{safeStyle} Learner</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{STYLE_DESCRIPTIONS[safeStyle]}</p>

        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Dominant Score</p>
          <p className="mt-1 text-2xl font-semibold text-white">{score}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/resources" className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            Continue to Resources
          </Link>
          <Link href="/tracker" className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800">
            Open Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
