"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BLUE = "#2563eb";
const BLUE_LIGHT = "#eff6ff";
const BLUE_MID = "#dbeafe";
const BLUE_DARK = "#1d4ed8";
const BLUE_SOFT = "#bfdbfe";
const TEXT = "#0f172a";
const TEXT_MUTED = "#64748b";
const BORDER = "#e2e8f0";
const WHITE = "#ffffff";

const labels = { V: "Visual", A: "Auditory", R: "Reading / Writing", K: "Kinesthetic" };
const shades = { V: BLUE, A: "#0ea5e9", R: "#6366f1", K: "#0891b2" };
const descriptions = {
  V: "You learn best through images, diagrams, and spatial understanding. Charts, concept maps, and visual metaphors help you encode and recall information most effectively.",
  A: "You learn best through listening and speaking. Discussions, verbal explanations, podcasts, and talking through ideas are your strongest pathways to understanding.",
  R: "You learn best through reading and writing. Taking structured notes, reading well-written material, and expressing ideas in writing suits you best.",
  K: "You learn best through practice, experience, and hands-on engagement. Doing, experimenting, and real-world application cement knowledge for you."
};
const tips = {
  V: ["Use colour-coded notes and mind maps", "Watch video explanations and animations", "Turn concepts into diagrams before memorising"],
  A: ["Record lectures and replay them", "Study aloud or join study groups", "Use text-to-speech for long readings"],
  R: ["Write summaries after every session", "Create structured outlines and lists", "Read multiple sources on the same topic"],
  K: ["Solve practice problems first, then read theory", "Apply concepts to real-world situations", "Build, simulate, or act out what you're learning"]
};

function Results({ scores }) {
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const isMultimodal = sorted[1][1] >= sorted[0][1] - 1;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-slate-950 p-8 shadow-lg shadow-black/20">
        <div className="mb-6 inline-flex rounded-full bg-indigo-500/15 px-4 py-2 text-xs uppercase tracking-[0.3em] text-indigo-200">
          Your Results
        </div>
        <h2 className="text-3xl font-bold text-white">{isMultimodal ? "Multimodal Learner" : `${labels[dominant]} Learner`}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          {isMultimodal
            ? `Your scores spread across multiple styles. Your primary lean is ${labels[dominant]}, but you adapt well to different formats.`
            : descriptions[dominant]}
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/20">
        <h3 className="text-xs uppercase tracking-[0.28em] text-slate-500">Score Breakdown</h3>
        <div className="mt-6 space-y-4">
          {sorted.map(([style, count]) => (
            <div key={style} className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span style={{ color: shades[style] }}>{labels[style]}</span>
                <span className="text-slate-400">{count} / {total} answers</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                <div className={`h-full rounded-full`} style={{ width: `${(count / total) * 100}%`, backgroundColor: shades[style] }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-indigo-200">
          <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          Primary Style — {labels[dominant]}
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">{descriptions[dominant]}</p>
        <div className="mt-6 space-y-3 border-t border-slate-800 pt-5">
          {tips[dominant].map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-indigo-500" />
              <p className="text-sm leading-7 text-slate-300">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/tracker" className="rounded-3xl bg-accent px-5 py-4 text-sm font-semibold text-white transition hover:bg-indigo-500 text-center">
          Go to Study Tracker →
        </Link>
        <Link href="/assessment" className="rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4 text-sm font-semibold text-slate-100 transition hover:bg-slate-900 text-center">
          Retake Assessment
        </Link>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [scores, setScores] = useState({ V: 0, A: 0, R: 0, K: 0 });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vark_scores");
      if (stored) {
        setScores(JSON.parse(stored));
      }
    } catch (e) {
      // ignore errors
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">VARK Assessment</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Your Results</h1>
          <p className="mt-2 text-sm text-slate-400">Review your learning style and continue to the tracker.</p>
        </div>
        <Results scores={scores} />
      </div>
    </div>
  );
}
