"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@/app/context/AppContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  const ampm = i >= 12 ? "PM" : "AM";
  const h = i % 12 || 12;
  return `${h}${ampm}`;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return d;
  }
}

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function timeToHour(t) {
  const [h, m] = (t || "09:00").split(":").map(Number);
  return h + m / 60;
}

// ─── Slider ───────────────────────────────────────────────────────────────────
function Slider({ label, value, onChange, min = 1, max = 5, color }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {value}/{max}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{
          width: "100%",
          appearance: "none",
          height: 6,
          borderRadius: 4,
          cursor: "pointer",
          outline: "none",
          background: `linear-gradient(to right, ${color} ${pct}%, #1e2d45 ${pct}%)`,
        }}
      />
    </div>
  );
}

// ─── Suggestion card ──────────────────────────────────────────────────────────
function Suggestion({ text, color }) {
  const parts = text.split(/\*\*(.*?)\*\*/);
  return (
    <div
      style={{
        background: color + "12",
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 10,
        padding: "12px 16px",
        fontSize: 13,
        color: "#94a3b8",
        lineHeight: 1.6,
      }}
    >
      {parts.map((part, j) =>
        j % 2 === 1 ? (
          <strong key={j} style={{ color: "#f1f5f9" }}>
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </div>
  );
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────
function AnalyticsPanel({ sessions }) {
  const hasEnough = sessions.length >= 5;

  const stats = useMemo(() => {
    if (!hasEnough) return null;

    // By hour
    const hourBuckets = {};
    sessions.forEach((s) => {
      const h = Math.floor(timeToHour(s.startTime || "09:00"));
      if (!hourBuckets[h]) hourBuckets[h] = { energy: [], distraction: [], duration: [] };
      hourBuckets[h].energy.push(s.energy ?? 3);
      hourBuckets[h].distraction.push(s.distraction ?? 2);
      hourBuckets[h].duration.push(s.duration);
    });

    const hourData = Object.entries(hourBuckets)
      .map(([h, d]) => ({
        hour: +h,
        label: HOUR_LABELS[+h],
        energy: avg(d.energy),
        distraction: avg(d.distraction),
        score: avg(d.energy) - avg(d.distraction) * 0.8,
      }))
      .sort((a, b) => a.hour - b.hour);

    const bestHour = [...hourData].sort((a, b) => b.score - a.score)[0];

    // By duration bucket
    const dBuckets = { "< 30": [], "30-60": [], "60-90": [], "90+": [] };
    sessions.forEach((s) => {
      const k =
        s.duration < 30
          ? "< 30"
          : s.duration <= 60
          ? "30-60"
          : s.duration <= 90
          ? "60-90"
          : "90+";
      dBuckets[k].push(s);
    });

    const durationData = Object.entries(dBuckets).map(([label, arr]) => ({
      label,
      count: arr.length,
      avgEnergy: arr.length ? avg(arr.map((x) => x.energy ?? 3)) : 0,
      avgDistraction: arr.length ? avg(arr.map((x) => x.distraction ?? 2)) : 0,
    }));

    const optimalDuration = [...durationData]
      .filter((d) => d.count > 0)
      .sort(
        (a, b) =>
          b.avgEnergy - b.avgDistraction * 0.8 - (a.avgEnergy - a.avgDistraction * 0.8)
      )[0]?.label;

    // Daily trend
    const byDate = {};
    sessions.forEach((s) => {
      if (!byDate[s.date]) byDate[s.date] = { energy: [], distraction: [], duration: [] };
      byDate[s.date].energy.push(s.energy ?? 3);
      byDate[s.date].distraction.push(s.distraction ?? 2);
      byDate[s.date].duration.push(s.duration);
    });

    const trend = Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, d]) => ({
        date: fmtDate(date),
        energy: avg(d.energy),
        distraction: avg(d.distraction),
        totalMinutes: d.duration.reduce((a, b) => a + b, 0),
      }));

    // Aggregates
    const avgEnergy = avg(sessions.map((s) => s.energy ?? 3));
    const avgDistraction = avg(sessions.map((s) => s.distraction ?? 2));
    const totalMinutes = sessions.reduce((a, s) => a + s.duration, 0);
    const avgSession = totalMinutes / sessions.length;

    // Pearson correlation
    const eArr = sessions.map((s) => s.energy ?? 3);
    const dArr = sessions.map((s) => s.distraction ?? 2);
    const eMean = avg(eArr);
    const dMean = avg(dArr);
    const num = eArr.reduce((s, e, i) => s + (e - eMean) * (dArr[i] - dMean), 0);
    const den =
      Math.sqrt(eArr.reduce((s, e) => s + (e - eMean) ** 2, 0)) *
      Math.sqrt(dArr.reduce((s, d) => s + (d - dMean) ** 2, 0));
    const correlation = den === 0 ? 0 : num / den;

    // Suggestions
    const suggestions = [];
    if (bestHour) {
      const period =
        bestHour.hour < 12 ? "morning" : bestHour.hour < 17 ? "afternoon" : "evening";
      suggestions.push(
        `🕐 Your peak focus window is around **${bestHour.label}**. Schedule your hardest topics in the ${period}.`
      );
    }
    if (optimalDuration)
      suggestions.push(
        `⏱ Sessions of **${optimalDuration} minutes** give you the best energy-to-distraction ratio. Stick to this range.`
      );
    if (avgDistraction > 3.5)
      suggestions.push(
        `📵 Your average distraction is high (**${avgDistraction.toFixed(1)}/5**). Try phone-free sessions or a website blocker.`
      );
    if (avgEnergy < 2.5)
      suggestions.push(
        `😴 Average energy is low (**${avgEnergy.toFixed(1)}/5**). Review your sleep routine and study during your peak-energy hours.`
      );
    if (correlation > 0.3)
      suggestions.push(
        `⚡ Higher energy tends to come with higher distraction for you. Channel that energy with active study techniques like practice problems.`
      );
    else if (correlation < -0.2)
      suggestions.push(
        `✅ When your energy is up, distraction goes down — you're naturally focused when energised. Protect your high-energy windows.`
      );
    if (avgSession > 90)
      suggestions.push(
        `🔄 Your average session is **${Math.round(avgSession)} min**. Consider the Pomodoro technique (25 on / 5 off) to maintain quality.`
      );

    return {
      hourData,
      bestHour,
      durationData,
      optimalDuration,
      trend,
      avgEnergy,
      avgDistraction,
      totalMinutes,
      avgSession,
      correlation,
      suggestions,
    };
  }, [sessions, hasEnough]);

  if (!hasEnough) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20 mt-6">
        <h2 className="text-xl font-semibold text-white">Analytics</h2>
        <p className="mt-2 text-slate-300 text-sm">
          Log at least{" "}
          <span className="text-indigo-400 font-semibold">5 sessions</span> to unlock analytics.
          You&apos;ve logged{" "}
          <span className="text-white font-semibold">{sessions.length}</span> so far.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 bg-slate-700 rounded h-2">
            <div
              className="h-2 rounded bg-indigo-500 transition-all"
              style={{ width: `${(sessions.length / 5) * 100}%` }}
            />
          </div>
          <span className="text-indigo-400 font-bold text-sm">{sessions.length}/5</span>
        </div>
      </div>
    );
  }

  // SVG chart dimensions
  const tw = 460;
  const th = 160;
  const pad = 40;
  const tx = (i) => (i / Math.max(stats.trend.length - 1, 1)) * (tw - pad * 2) + pad;
  const ty = (v) => th - pad - (v / 5) * (th - pad * 2);

  const makePolyline = (key, color) => {
    const pts = stats.trend.map((d, i) => `${tx(i)},${ty(d[key])}`).join(" ");
    return <polyline key={key} points={pts} fill="none" stroke={color} strokeWidth={2} />;
  };

  const maxBarScore = Math.max(...stats.hourData.map((d) => Math.abs(d.score)), 1);
  const bw = Math.max(14, Math.min(32, (280 - 40) / Math.max(stats.hourData.length, 1) - 4));

  return (
    <div className="mt-6 space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            icon: "⚡",
            label: "Avg Energy",
            value: stats.avgEnergy.toFixed(1),
            sub: "out of 5",
            color: "#10b981",
          },
          {
            icon: "🎯",
            label: "Avg Distraction",
            value: stats.avgDistraction.toFixed(1),
            sub: "lower is better",
            color: "#ef4444",
          },
          {
            icon: "⏱",
            label: "Total Study",
            value: `${Math.round(stats.totalMinutes / 60)}h`,
            sub: `${Math.round(stats.avgSession)} min avg`,
            color: "#3b82f6",
          },
          {
            icon: "🏆",
            label: "Best Hour",
            value: stats.bestHour?.label || "—",
            sub: "peak performance",
            color: "#f59e0b",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"
          >
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            {s.sub && <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <div className="text-sm font-bold text-white mb-1">Daily Energy & Distraction Trend</div>
        <div className="text-xs text-slate-500 mb-3">How your sessions have changed over time</div>
        <div className="flex gap-4 text-xs text-slate-400 mb-2">
          <span style={{ color: "#10b981" }}>— Energy</span>
          <span style={{ color: "#ef4444" }}>— Distraction</span>
        </div>
        <div className="overflow-x-auto">
          <svg width="100%" viewBox={`0 0 ${tw} ${th}`} style={{ display: "block" }}>
            {[1, 2, 3, 4, 5].map((v) => (
              <line
                key={v}
                x1={pad}
                y1={ty(v)}
                x2={tw - pad}
                y2={ty(v)}
                stroke="#1e2d45"
                strokeDasharray="3 3"
              />
            ))}
            {[1, 2, 3, 4, 5].map((v) => (
              <text
                key={`l${v}`}
                x={pad - 4}
                y={ty(v) + 4}
                textAnchor="end"
                fontSize={9}
                fill="#64748b"
              >
                {v}
              </text>
            ))}
            {stats.trend.length > 1 && makePolyline("energy", "#10b981")}
            {stats.trend.length > 1 && makePolyline("distraction", "#ef4444")}
            {stats.trend.map((d, i) => (
              <circle key={`e${i}`} cx={tx(i)} cy={ty(d.energy)} r={3} fill="#10b981" />
            ))}
            {stats.trend.map((d, i) => (
              <circle key={`d${i}`} cx={tx(i)} cy={ty(d.distraction)} r={3} fill="#ef4444" />
            ))}
            {stats.trend.map((d, i) =>
              i % Math.max(1, Math.floor(stats.trend.length / 6)) === 0 ? (
                <text
                  key={`t${i}`}
                  x={tx(i)}
                  y={th - 8}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#64748b"
                >
                  {d.date}
                </text>
              ) : null
            )}
          </svg>
        </div>
      </div>

      {/* Best hours */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <div className="text-sm font-bold text-white mb-1">Best Learning Times of Day</div>
        <div className="text-xs text-slate-500 mb-3">
          Performance = energy − (distraction × 0.8)
        </div>
        <div className="overflow-x-auto">
          <svg
            width="100%"
            viewBox={`0 0 ${Math.max(300, stats.hourData.length * (bw + 8) + 60)} 180`}
            style={{ display: "block" }}
          >
            {stats.hourData.map((d, i) => {
              const x = i * (bw + 8) + pad;
              const bh = Math.max(2, (Math.abs(d.score) / maxBarScore) * 110);
              const isBest = d.hour === stats.bestHour?.hour;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={140 - bh}
                    width={bw}
                    height={bh}
                    rx={4}
                    fill={isBest ? "#f59e0b" : "#3b82f6"}
                    opacity={isBest ? 1 : 0.55}
                  />
                  <text
                    x={x + bw / 2}
                    y={155}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#64748b"
                  >
                    {d.label}
                  </text>
                  <text
                    x={x + bw / 2}
                    y={140 - bh - 4}
                    textAnchor="middle"
                    fontSize={8}
                    fill={isBest ? "#f59e0b" : "#94a3b8"}
                  >
                    {d.score.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        {stats.bestHour && (
          <div
            className="mt-3 rounded-lg px-3 py-2 text-xs"
            style={{
              background: "#f59e0b15",
              border: "1px solid #f59e0b33",
              color: "#f59e0b",
            }}
          >
            ⭐ Peak window: <strong>{stats.bestHour.label}</strong> — Avg energy{" "}
            {stats.bestHour.energy.toFixed(1)}, Distraction{" "}
            {stats.bestHour.distraction.toFixed(1)}
          </div>
        )}
      </div>

      {/* Duration analysis */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <div className="text-sm font-bold text-white mb-1">Optimal Study Duration</div>
        <div className="text-xs text-slate-500 mb-3">
          Which session lengths give the best focus
        </div>
        <div className="flex gap-4 text-xs text-slate-400 mb-3">
          <span style={{ color: "#10b981" }}>■ Avg Energy</span>
          <span style={{ color: "#ef4444" }}>■ Avg Distraction</span>
        </div>
        <div className="flex gap-3 items-end h-24">
          {stats.durationData
            .filter((d) => d.count > 0)
            .map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-1 items-end" style={{ height: 72 }}>
                  <div
                    style={{
                      width: 14,
                      background: "#10b981",
                      borderRadius: "3px 3px 0 0",
                      height: `${(d.avgEnergy / 5) * 72}px`,
                      opacity: 0.85,
                    }}
                  />
                  <div
                    style={{
                      width: 14,
                      background: "#ef4444",
                      borderRadius: "3px 3px 0 0",
                      height: `${(d.avgDistraction / 5) * 72}px`,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <div className="text-xs text-slate-500">{d.label}</div>
              </div>
            ))}
        </div>
        {stats.optimalDuration && (
          <div
            className="mt-3 rounded-lg px-3 py-2 text-xs"
            style={{
              background: "#10b98115",
              border: "1px solid #10b98133",
              color: "#10b981",
            }}
          >
            ✅ Optimal length: <strong>{stats.optimalDuration} minutes</strong> — best
            energy-to-distraction ratio
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <div className="text-sm font-bold text-white mb-3">💡 Personalised Suggestions</div>
        <div className="flex flex-col gap-2">
          {stats.suggestions.length > 0 ? (
            stats.suggestions.map((s, i) => <Suggestion key={i} text={s} color="#3b82f6" />)
          ) : (
            <p className="text-sm text-slate-400">
              Keep logging sessions to get personalised suggestions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrackerPage() {
  const {
    studySessions,
    addStudySession,
    fetchSchedule,
    deleteTask,
    loading,
    error,
  } = useAppContext();

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [energy, setEnergy] = useState(3);
  const [distraction, setDistraction] = useState(2);
  const [mood, setMood] = useState(3);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("tracker");

  useEffect(() => {
    fetchSchedule().catch(() => {});
  }, [fetchSchedule]);

  const sessions = useMemo(() => {
    return [...studySessions].sort((a, b) => {
      const left = a.startTime || a.date;
      const right = b.startTime || b.date;
      return new Date(right) - new Date(left);
    });
  }, [studySessions]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !duration || !date) return;

    try {
      await addStudySession({
        title: title.trim(),
        duration: Number(duration),
        date,
        startTime,
        energy,
        distraction,
        mood,
        notes,
      });
      await fetchSchedule();
      setTitle("");
      setDuration("");
      setNotes("");
      setEnergy(3);
      setDistraction(2);
      setMood(3);
    } catch {}
  };

  const handleDelete = async (session) => {
    if (!session?.taskId) return;
    try {
      await deleteTask(session.taskId);
    } catch {}
  };

  const inp =
    "w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-accent";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "tracker", label: "📝 Study Tracker" },
          { id: "analytics", label: "📊 Analytics" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold border transition ${
              activeTab === t.id
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "tracker" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Left — Form */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
            <h1 className="text-2xl font-semibold text-white">Study Tracker</h1>
            <p className="mt-2 text-slate-300">Log sessions to build your learning history.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Session Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: DSA revision"
                  className={inp}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={inp}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inp}
                />
              </div>

              <div className="border-t border-slate-700 pt-4">
                <Slider
                  label="⚡ Energy Level"
                  value={energy}
                  onChange={setEnergy}
                  color="#10b981"
                />
                <Slider
                  label="🎯 Distraction Level  (1 = focused · 5 = very distracted)"
                  value={distraction}
                  onChange={setDistraction}
                  color="#ef4444"
                />
                <Slider
                  label="😊 Mood"
                  value={mood}
                  onChange={setMood}
                  color="#f59e0b"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any observations about this session…"
                  rows={2}
                  className={`${inp} resize-y`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-indigo-500"
              >
                {loading ? "Saving..." : "Add Session"}
              </button>
            </form>

            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
          </section>

          {/* Right — Session List */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
            <h2 className="text-xl font-semibold text-white">Logged Sessions</h2>

            {sessions.length === 0 ? (
              <p className="mt-4 text-slate-300">No sessions yet. Add your first study session.</p>
            ) : (
              <div className="mt-4 space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {sessions.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{session.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {session.date}
                          {session.startTime ? ` · ${session.startTime}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {session.energy != null && (
                          <span className="text-xs text-emerald-400">⚡{session.energy}</span>
                        )}
                        {session.distraction != null && (
                          <span className="text-xs text-red-400">🎯{session.distraction}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(session)}
                          disabled={loading || !session.taskId}
                          className="rounded-lg border border-rose-700 px-2 py-1 text-xs text-rose-200 hover:bg-rose-900/30 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{session.duration} minutes</p>
                    {session.notes ? (
                      <p className="mt-1 text-xs text-slate-500 italic">{session.notes}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "analytics" && <AnalyticsPanel sessions={sessions} />}
    </div>
  );
}