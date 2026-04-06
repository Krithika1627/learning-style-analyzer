"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAppContext } from "@/app/context/AppContext";

const LABELS = ["Visual", "Auditory", "Read/Write", "Kinesthetic"];

export default function AnalysisPage() {
  const { result } = useAppContext();

  const chartData = LABELS.map((name) => ({
    name,
    score: Number(result?.[name] ?? 0),
  }));

  const total = chartData.reduce((sum, item) => sum + item.score, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
        <h1 className="text-3xl font-semibold text-white">Learning Style Analysis</h1>
        <p className="mt-2 text-slate-300">
          Dynamic score distribution across all VARK categories.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
        {total === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-600 bg-slate-900/40 p-8 text-center">
            <p className="text-slate-300">No assessment data found yet.</p>
            <Link href="/assessment/instructions" className="mt-4 inline-block rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
              Start Assessment
            </Link>
          </div>
        ) : (
          <>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "#1e293b" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#e2e8f0",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {chartData.map((item) => (
                <div key={item.name} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">{item.name}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.score}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/results" className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
                View Results
              </Link>
              <Link href="/resources" className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800">
                Open Resources
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
