"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts";

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#0b0f1a",
  surface: "#111827",
  card: "#151e2d",
  border: "#1e2d45",
  accent: "#3b82f6",
  accentDark: "#1d4ed8",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  text: "#f1f5f9",
  textMuted: "#64748b",
  textSoft: "#94a3b8",
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
const KEYS = {
  sessions: "st:sessions",
  vark: "st:vark",
  habits: "st:habits",
};

function lsGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { }
}

// ─── VARK config ──────────────────────────────────────────────────────────────
const VARK_NAMES = { V: "Visual", A: "Auditory", R: "Read/Write", K: "Kinesthetic" };
const VARK_COLORS = { V: "#f59e0b", A: "#10b981", R: "#8b5cf6", K: "#ef4444" };
const VARK_ICONS = { V: "👁", A: "👂", R: "📝", K: "🤲" };

const VARK_HABITS = {
  V: [
    "Draw a mind map before each study session",
    "Use color-coded highlights for key concepts",
    "Watch a video explanation for each new topic",
    "Create visual flashcards with diagrams & images",
    "Organise notes with charts, tables & visual hierarchy",
  ],
  A: [
    "Record yourself summarising topics & replay",
    "Study in a discussion group or with a partner",
    "Read notes aloud during each session",
    "Use text-to-speech for dense reading material",
    "Create mnemonics & rhymes for memorisation",
  ],
  R: [
    "Rewrite notes in your own words after sessions",
    "Compile a glossary of key terms per subject",
    "Read multiple sources on the same topic",
    "Write summaries & essays to test comprehension",
    "Use Cornell note-taking or SQ3R method",
  ],
  K: [
    "Do practice problems immediately after theory",
    "Apply concepts to real-world personal projects",
    "Take Pomodoro breaks (25 min on, 5 min move)",
    "Teach what you learned to someone else",
    "Build or simulate something related to the topic",
  ],
};

const SUBJECTS = [
  "Mathematics", "Science", "History",
  "Language", "Programming", "Art", "Other",
];

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  const ampm = i >= 12 ? "PM" : "AM";
  const h = i % 12 || 12;
  return `${h}${ampm}`;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().slice(0, 10); }
function fmtDate(d) { return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function timeToHour(t) { const [h, m] = t.split(":").map(Number); return h + m / 60; }

// ─── Reusable UI ──────────────────────────────────────────────────────────────

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: 24, ...style,
    }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color = C.accent, icon }) {
  return (
    <Card style={{ flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.textSoft, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

function RatingDots({ value, max = 5, color = C.accent }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: i < value ? color : C.border,
        }} />
      ))}
    </div>
  );
}

function Slider({ label, value, onChange, min = 1, max = 5, color = C.accent }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: C.textSoft }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}/{max}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{
          width: "100%", appearance: "none", height: 6,
          borderRadius: 4, cursor: "pointer", outline: "none",
          background: `linear-gradient(to right, ${color} ${pct}%, ${C.border} ${pct}%)`,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {Array.from({ length: max - min + 1 }, (_, i) => (
          <span key={i} style={{ fontSize: 10, color: C.textMuted }}>{min + i}</span>
        ))}
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "10px 14px", fontSize: 12,
    }}>
      <div style={{ color: C.textSoft, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || C.text, fontWeight: 600 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </div>
      ))}
    </div>
  );
}

function Suggestion({ text, color }) {
  return (
    <div style={{
      background: color + "12", border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 10, padding: "12px 16px",
      fontSize: 13, color: C.textSoft, lineHeight: 1.6,
    }}>
      {text.split(/\*\*(.*?)\*\*/).map((part, j) =>
        j % 2 === 1
          ? <strong key={j} style={{ color: C.text }}>{part}</strong>
          : part
      )}
    </div>
  );
}

function inputStyle() {
  return {
    width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 13,
    background: C.surface, border: `1px solid ${C.border}`, color: C.text,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
}

function navBtnStyle(disabled = false) {
  return {
    width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
    background: C.card, color: disabled ? C.textMuted : C.text,
    cursor: disabled ? "not-allowed" : "pointer", fontSize: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    opacity: disabled ? 0.4 : 1,
  };
}

// ─── Log Page ─────────────────────────────────────────────────────────────────
function LogPage({ onSave, sessions }) {
  const [form, setForm] = useState({
    date: todayStr(), startTime: "09:00",
    duration: 60, subject: "Mathematics",
    energy: 3, distraction: 2, mood: 3, notes: "",
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.subject) return;
    onSave({ ...form, id: Date.now() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const recent = [...sessions].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, letterSpacing: -0.5 }}>
          Log Study Session
        </h2>
        <p style={{ color: C.textMuted, marginTop: 6, fontSize: 13 }}>
          Track your sessions to unlock personalised insights
        </p>
      </div>

      <Card>
        {/* Date / Time / Duration */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 6, fontWeight: 700, letterSpacing: 0.5 }}>DATE</label>
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle()} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 6, fontWeight: 700, letterSpacing: 0.5 }}>START TIME</label>
            <input type="time" value={form.startTime} onChange={e => set("startTime", e.target.value)} style={inputStyle()} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 6, fontWeight: 700, letterSpacing: 0.5 }}>DURATION (min)</label>
            <input type="number" min={5} max={480} value={form.duration} onChange={e => set("duration", +e.target.value)} style={inputStyle()} />
          </div>
        </div>

        {/* Subject */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 8, fontWeight: 700, letterSpacing: 0.5 }}>SUBJECT</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => set("subject", s)} style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                border: `1px solid ${form.subject === s ? C.accent : C.border}`,
                background: form.subject === s ? C.accent + "22" : "transparent",
                color: form.subject === s ? C.accent : C.textMuted,
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
          <Slider label="⚡ Energy Level" value={form.energy} onChange={v => set("energy", v)} color={C.green} />
          <Slider label="🎯 Distraction Level  (1 = focused · 5 = very distracted)" value={form.distraction} onChange={v => set("distraction", v)} color={C.red} />
          <Slider label="😊 Mood" value={form.mood} onChange={v => set("mood", v)} color={C.amber} />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 6, fontWeight: 700, letterSpacing: 0.5 }}>NOTES (optional)</label>
          <textarea
            value={form.notes} onChange={e => set("notes", e.target.value)}
            placeholder="Any observations about this session…"
            rows={2}
            style={{ ...inputStyle(), resize: "vertical", lineHeight: 1.5 }}
          />
        </div>

        <button onClick={handleSave} style={{
          width: "100%", padding: 14, borderRadius: 12, border: "none",
          background: saved ? C.green : `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
          color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
          transition: "all 0.3s", letterSpacing: 0.3,
          boxShadow: `0 4px 20px ${saved ? C.green + "44" : C.accent + "44"}`,
        }}>
          {saved ? "✓ Session Saved!" : "Save Session"}
        </button>
      </Card>

      {/* Recent sessions */}
      {recent.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 14, letterSpacing: 0.8, textTransform: "uppercase" }}>
            Recent Sessions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recent.map(s => (
              <div key={s.id} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: "14px 18px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.subject}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                    {fmtDate(s.date)} · {s.startTime} · {s.duration} min
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 4 }}>ENERGY</div>
                    <RatingDots value={s.energy} color={C.green} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 4 }}>DISTRACTION</div>
                    <RatingDots value={s.distraction} color={C.red} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
function AnalyticsPage({ sessions }) {
  const hasEnough = sessions.length >= 5;

  const stats = useMemo(() => {
    if (!hasEnough) return null;

    // ── By hour ──────────────────────────────────────────────────────────────
    const hourBuckets = {};
    sessions.forEach(s => {
      const h = Math.floor(timeToHour(s.startTime));
      if (!hourBuckets[h]) hourBuckets[h] = { energy: [], distraction: [], duration: [] };
      hourBuckets[h].energy.push(s.energy);
      hourBuckets[h].distraction.push(s.distraction);
      hourBuckets[h].duration.push(s.duration);
    });

    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    const hourData = Object.entries(hourBuckets).map(([h, d]) => ({
      hour: +h,
      label: HOUR_LABELS[+h],
      energy: avg(d.energy),
      distraction: avg(d.distraction),
      duration: avg(d.duration),
      count: d.energy.length,
      score: avg(d.energy) - avg(d.distraction) * 0.8,
    })).sort((a, b) => a.hour - b.hour);

    const bestHour = [...hourData].sort((a, b) => b.score - a.score)[0];

    // ── By duration bucket ────────────────────────────────────────────────────
    const dBuckets = { "< 30": [], "30–60": [], "60–90": [], "90+": [] };
    sessions.forEach(s => {
      const k = s.duration < 30 ? "< 30" : s.duration <= 60 ? "30–60" : s.duration <= 90 ? "60–90" : "90+";
      dBuckets[k].push(s);
    });
    const durationData = Object.entries(dBuckets).map(([label, arr]) => ({
      label,
      count: arr.length,
      avgEnergy: arr.length ? avg(arr.map(x => x.energy)) : 0,
      avgDistraction: arr.length ? avg(arr.map(x => x.distraction)) : 0,
    }));
    const optimalDuration = [...durationData]
      .filter(d => d.count > 0)
      .sort((a, b) => (b.avgEnergy - b.avgDistraction * 0.8) - (a.avgEnergy - a.avgDistraction * 0.8))[0]?.label;

    // ── Daily trend ───────────────────────────────────────────────────────────
    const byDate = {};
    sessions.forEach(s => {
      if (!byDate[s.date]) byDate[s.date] = { energy: [], distraction: [], mood: [], duration: [] };
      byDate[s.date].energy.push(s.energy);
      byDate[s.date].distraction.push(s.distraction);
      byDate[s.date].mood.push(s.mood || 3);
      byDate[s.date].duration.push(s.duration);
    });
    const trend = Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, d]) => ({
        date: fmtDate(date),
        energy: avg(d.energy),
        distraction: avg(d.distraction),
        mood: avg(d.mood),
        totalMinutes: d.duration.reduce((a, b) => a + b, 0),
      }));

    // ── Scatter ───────────────────────────────────────────────────────────────
    const scatter = sessions.map(s => ({
      x: s.energy, y: s.distraction, subject: s.subject, date: s.date,
    }));

    // ── Aggregates ────────────────────────────────────────────────────────────
    const avgEnergy = avg(sessions.map(s => s.energy));
    const avgDistraction = avg(sessions.map(s => s.distraction));
    const totalMinutes = sessions.reduce((a, s) => a + s.duration, 0);
    const avgSession = totalMinutes / sessions.length;

    // ── Pearson correlation ───────────────────────────────────────────────────
    const eArr = sessions.map(s => s.energy);
    const dArr = sessions.map(s => s.distraction);
    const eMean = avg(eArr), dMean = avg(dArr);
    const num = eArr.reduce((s, e, i) => s + (e - eMean) * (dArr[i] - dMean), 0);
    const den = Math.sqrt(eArr.reduce((s, e) => s + (e - eMean) ** 2, 0)) *
      Math.sqrt(dArr.reduce((s, d) => s + (d - dMean) ** 2, 0));
    const correlation = den === 0 ? 0 : num / den;

    // ── Suggestions ──────────────────────────────────────────────────────────
    const suggestions = [];
    if (bestHour) {
      const period = bestHour.hour < 12 ? "morning" : bestHour.hour < 17 ? "afternoon" : "evening";
      suggestions.push(`🕐 Your peak focus window is around **${bestHour.label}**. Schedule your hardest topics in the ${period}.`);
    }
    if (optimalDuration)
      suggestions.push(`⏱ Sessions of **${optimalDuration} minutes** give you the best energy-to-distraction ratio. Stick to this range.`);
    if (avgDistraction > 3.5)
      suggestions.push(`📵 Your average distraction is high (**${avgDistraction.toFixed(1)}/5**). Try phone-free sessions or a website blocker.`);
    if (avgEnergy < 2.5)
      suggestions.push(`😴 Average energy is low (**${avgEnergy.toFixed(1)}/5**). Review your sleep routine and study during your peak-energy hours.`);
    if (correlation > 0.3)
      suggestions.push(`⚡ Higher energy tends to come with higher distraction for you. Channel that energy with active study techniques like practice problems.`);
    else if (correlation < -0.2)
      suggestions.push(`✅ When your energy is up, distraction goes down — you're naturally focused when energised. Protect your high-energy windows.`);
    if (avgSession > 90)
      suggestions.push(`🔄 Your average session is **${Math.round(avgSession)} min**. Consider the Pomodoro technique (25 on / 5 off) to maintain quality.`);

    return { hourData, bestHour, durationData, optimalDuration, scatter, trend, avgEnergy, avgDistraction, totalMinutes, avgSession, correlation, suggestions };
  }, [sessions, hasEnough]);

  if (!hasEnough) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📊</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text }}>Not Enough Data Yet</h2>
        <p style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.7 }}>
          Log at least <strong style={{ color: C.accent }}>5 study sessions</strong> to unlock your analytics.<br />
          You've logged <strong style={{ color: C.text }}>{sessions.length}</strong> so far. Keep going!
        </p>
        <Card style={{ marginTop: 24, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, background: C.border, borderRadius: 4, height: 8 }}>
              <div style={{
                width: `${(sessions.length / 5) * 100}%`, height: "100%",
                background: C.accent, borderRadius: 4, transition: "width 0.5s",
              }} />
            </div>
            <span style={{ color: C.accent, fontWeight: 700, fontSize: 13 }}>{sessions.length}/5</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, letterSpacing: -0.5 }}>Analytics</h2>
        <p style={{ color: C.textMuted, marginTop: 6, fontSize: 13 }}>Based on {sessions.length} logged sessions</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard icon="⚡" label="Avg Energy" value={stats.avgEnergy.toFixed(1)} sub="out of 5" color={C.green} />
        <StatCard icon="🎯" label="Avg Distraction" value={stats.avgDistraction.toFixed(1)} sub="lower is better" color={C.red} />
        <StatCard icon="⏱" label="Total Study Time" value={`${Math.round(stats.totalMinutes / 60)}h`} sub={`${Math.round(stats.avgSession)} min avg`} color={C.accent} />
        <StatCard icon="🏆" label="Best Study Hour" value={stats.bestHour?.label || "—"} sub="peak performance" color={C.amber} />
      </div>

      {/* Trend */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Daily Energy & Distraction Trend</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>How your sessions have changed over time</div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={stats.trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.green} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.green} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.red} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.red} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: C.textMuted, fontSize: 10 }} />
            <YAxis domain={[0, 5]} tick={{ fill: C.textMuted, fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: C.textSoft }} />
            <Area type="monotone" dataKey="energy" stroke={C.green} fill="url(#gE)" strokeWidth={2} name="Energy" dot={{ fill: C.green, r: 3 }} />
            <Area type="monotone" dataKey="distraction" stroke={C.red} fill="url(#gD)" strokeWidth={2} name="Distraction" dot={{ fill: C.red, r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Best hours */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Best Learning Times of Day</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Performance score = energy − (distraction × 0.8)</div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.hourData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: C.textMuted, fontSize: 10 }} />
            <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="score" name="Performance Score" radius={[6, 6, 0, 0]}>
              {stats.hourData.map((entry, i) => (
                <Cell key={i}
                  fill={entry.hour === stats.bestHour?.hour ? C.amber : C.accent}
                  opacity={entry.hour === stats.bestHour?.hour ? 1 : 0.55}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {stats.bestHour && (
          <div style={{
            marginTop: 14, background: C.amber + "15", border: `1px solid ${C.amber}33`,
            borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.amber,
          }}>
            ⭐ Peak window: <strong>{stats.bestHour.label}</strong> — Avg energy {stats.bestHour.energy.toFixed(1)}, Distraction {stats.bestHour.distraction.toFixed(1)}
          </div>
        )}
      </Card>

      {/* Duration analysis */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Optimal Study Duration</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Which session lengths give the best focus</div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.durationData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: C.textMuted, fontSize: 11 }} />
            <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: C.textSoft }} />
            <Bar dataKey="avgEnergy" name="Avg Energy" fill={C.green} radius={[4, 4, 0, 0]} />
            <Bar dataKey="avgDistraction" name="Avg Distraction" fill={C.red} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {stats.optimalDuration && (
          <div style={{
            marginTop: 14, background: C.green + "15", border: `1px solid ${C.green}33`,
            borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.green,
          }}>
            ✅ Optimal length: <strong>{stats.optimalDuration} minutes</strong> — best energy-to-distraction ratio
          </div>
        )}
      </Card>

      {/* Scatter */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Energy–Distraction Correlation</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>
            Pearson r:{" "}
            <span style={{ color: Math.abs(stats.correlation) > 0.3 ? C.amber : C.green, fontWeight: 700 }}>
              {stats.correlation.toFixed(2)}
            </span>
            {" "}({Math.abs(stats.correlation) < 0.2 ? "weak" : Math.abs(stats.correlation) < 0.5 ? "moderate" : "strong"}
            {" "}{stats.correlation >= 0 ? "positive" : "negative"})
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
            <XAxis dataKey="x" name="Energy" type="number" domain={[0.5, 5.5]} tick={{ fill: C.textMuted, fontSize: 10 }} label={{ value: "Energy", position: "insideBottom", offset: -10, fill: C.textMuted, fontSize: 10 }} />
            <YAxis dataKey="y" name="Distraction" type="number" domain={[0.5, 5.5]} tick={{ fill: C.textMuted, fontSize: 10 }} label={{ value: "Distraction", angle: -90, position: "insideLeft", fill: C.textMuted, fontSize: 10 }} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                  <div style={{ color: C.textSoft }}>{d.subject} · {fmtDate(d.date)}</div>
                  <div style={{ color: C.green }}>Energy: {d.x}</div>
                  <div style={{ color: C.red }}>Distraction: {d.y}</div>
                </div>
              );
            }} />
            <Scatter data={stats.scatter} fill={C.accent} opacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* Suggestions */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>💡 Personalised Suggestions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stats.suggestions.map((s, i) => <Suggestion key={i} text={s} color={C.accent} />)}
        </div>
      </Card>
    </div>
  );
}

// ─── Habits Page ──────────────────────────────────────────────────────────────
function HabitsPage({ varkResult, habitLog, onLogHabit }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const dominantVark = useMemo(() => {
    if (!varkResult) return null;
    return Object.entries(varkResult).sort((a, b) => b[1] - a[1])[0][0];
  }, [varkResult]);

  const habits = dominantVark ? VARK_HABITS[dominantVark] : [];

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay() + i + weekOffset * 7);
      return d.toISOString().slice(0, 10);
    });
  }, [weekOffset]);

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const isChecked = (date, idx) => habitLog[date]?.[idx] || false;

  const habitStats = habits.map((_, i) => {
    const done = weekDates.filter(d => isChecked(d, i)).length;
    return { done, pct: (done / 7) * 100 };
  });

  const adherence = habits.length > 0
    ? (habitStats.reduce((a, b) => a + b.done, 0) / (habits.length * 7)) * 100
    : 0;

  const streakData = habits.map((_, i) => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (habitLog[key]?.[i]) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  });

  const trendData = Array.from({ length: 4 }, (_, wi) => {
    const base = new Date();
    base.setDate(base.getDate() - base.getDay() - wi * 7);
    const dates = Array.from({ length: 7 }, (_, di) => {
      const d = new Date(base);
      d.setDate(d.getDate() + di);
      return d.toISOString().slice(0, 10);
    });
    const done = habits.reduce((sum, _, i) => sum + dates.filter(d => habitLog[d]?.[i]).length, 0);
    const possible = habits.length * 7;
    return {
      week: wi === 0 ? "This week" : `${wi}w ago`,
      adherence: possible > 0 ? Math.round((done / possible) * 100) : 0,
    };
  }).reverse();

  if (!varkResult) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🧠</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text }}>Complete Your VARK Assessment First</h2>
        <p style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.7 }}>
          Your habits are personalised based on your learning style.<br />
          Head to the Assessment page to find out your style.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, letterSpacing: -0.5 }}>Habit Tracker</h2>
          <p style={{ color: C.textMuted, marginTop: 6, fontSize: 13 }}>
            Habits for your{" "}
            <span style={{ color: VARK_COLORS[dominantVark], fontWeight: 700 }}>
              {VARK_ICONS[dominantVark]} {VARK_NAMES[dominantVark]}
            </span>{" "}
            learning style
          </p>
        </div>
        <Card style={{ padding: "12px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.accent }}>{Math.round(adherence)}%</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Weekly adherence</div>
        </Card>
      </div>

      {/* Week nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <button onClick={() => setWeekOffset(o => o - 1)} style={navBtnStyle()}>←</button>
        <span style={{ fontSize: 13, color: C.textSoft, fontWeight: 600 }}>
          {weekOffset === 0
            ? "This Week"
            : `${fmtDate(weekDates[0])} – ${fmtDate(weekDates[6])}`}
        </span>
        <button onClick={() => setWeekOffset(o => o + 1)} disabled={weekOffset >= 0} style={navBtnStyle(weekOffset >= 0)}>→</button>
      </div>

      {/* Habit grid */}
      <Card style={{ marginBottom: 20, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0 12px 14px 0", fontSize: 10, color: C.textMuted, fontWeight: 700, minWidth: 200 }}>HABIT</th>
              {weekDates.map((d, i) => (
                <th key={d} style={{
                  padding: "0 4px 14px", fontSize: 10, textAlign: "center", minWidth: 40,
                  color: d === todayStr() ? C.accent : C.textMuted,
                  fontWeight: d === todayStr() ? 800 : 600,
                }}>
                  <div>{DAY_LABELS[i]}</div>
                  <div style={{ fontSize: 9, marginTop: 2 }}>{d.slice(8)}</div>
                </th>
              ))}
              <th style={{ padding: "0 0 14px 12px", fontSize: 10, color: C.textMuted, fontWeight: 700, textAlign: "center", minWidth: 56 }}>WEEK</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, hi) => (
              <tr key={hi} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "14px 12px 14px 0" }}>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4 }}>{habit}</div>
                  {streakData[hi] > 0 && (
                    <div style={{ fontSize: 10, color: C.amber, marginTop: 3 }}>🔥 {streakData[hi]}-day streak</div>
                  )}
                </td>
                {weekDates.map(d => {
                  const checked = isChecked(d, hi);
                  const isFuture = d > todayStr();
                  return (
                    <td key={d} style={{ textAlign: "center", padding: "14px 4px" }}>
                      <button
                        onClick={() => !isFuture && onLogHabit(d, hi, !checked)}
                        disabled={isFuture}
                        style={{
                          width: 30, height: 30, borderRadius: 8, border: "none",
                          cursor: isFuture ? "default" : "pointer",
                          background: checked ? VARK_COLORS[dominantVark] + "33" : C.surface,
                          border: `1.5px solid ${checked ? VARK_COLORS[dominantVark] : C.border}`,
                          color: checked ? VARK_COLORS[dominantVark] : C.textMuted,
                          fontSize: 14, transition: "all 0.15s",
                          opacity: isFuture ? 0.25 : 1,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto",
                        }}
                      >
                        {checked ? "✓" : ""}
                      </button>
                    </td>
                  );
                })}
                <td style={{ textAlign: "center", padding: "14px 0 14px 12px" }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: habitStats[hi].done >= 5 ? C.green : habitStats[hi].done >= 3 ? C.amber : C.textMuted,
                  }}>
                    {habitStats[hi].done}/7
                  </div>
                  <div style={{ background: C.border, borderRadius: 3, height: 4, width: 36, margin: "4px auto 0", overflow: "hidden" }}>
                    <div style={{ width: `${habitStats[hi].pct}%`, height: "100%", background: VARK_COLORS[dominantVark], borderRadius: 3 }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* 4-week trend */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>4-Week Adherence Trend</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: C.textMuted, fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: C.textMuted, fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="adherence" name="Adherence %" radius={[6, 6, 0, 0]}>
              {trendData.map((entry, i) => (
                <Cell key={i} fill={entry.adherence >= 70 ? C.green : entry.adherence >= 40 ? C.amber : C.red} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Analysis */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📈 Habit Analysis</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {adherence >= 80 && (
            <Suggestion color={C.green} text="Excellent consistency! You're following your learning habits very well. Keep it up — consistency is where learning styles truly pay off." />
          )}
          {adherence >= 50 && adherence < 80 && (
            <Suggestion color={C.amber} text={`Good effort at **${Math.round(adherence)}% adherence**. Identify the 1–2 habits you skip most and assign them a fixed daily time slot.`} />
          )}
          {adherence < 50 && totalDoneThisWeek(habits, habitLog, weekDates) === 0 && (
            <Suggestion color={C.red} text="No habits logged this week yet. Start small — tick off just one habit today to build momentum." />
          )}
          {adherence < 50 && totalDoneThisWeek(habits, habitLog, weekDates) > 0 && (
            <Suggestion color={C.red} text={`Adherence is at **${Math.round(adherence)}%**. Start with 1–2 habits daily until they feel automatic, then layer in more.`} />
          )}
          {(() => {
            const best = habitStats.map((s, i) => ({ i, done: s.done })).sort((a, b) => b.done - a.done)[0];
            if (best && best.done > 0) return (
              <Suggestion color={C.accent} text={`Your strongest habit this week: **"${habits[best.i]}"** (${best.done}/7 days). Use this as your anchor and build other habits around the same time.`} />
            );
          })()}
          <Suggestion
            color={VARK_COLORS[dominantVark]}
            text={`As a **${VARK_NAMES[dominantVark]} learner**, these habits directly strengthen your natural learning pathway. Even 3–4 days/week of consistent practice leads to measurable retention gains.`}
          />
        </div>
      </Card>
    </div>
  );
}

function totalDoneThisWeek(habits, habitLog, weekDates) {
  return habits.reduce((sum, _, i) => sum + weekDates.filter(d => habitLog[d]?.[i]).length, 0);
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function Tracker() {
  const router = useRouter();
  const [page, setPage] = useState("log");
  const [sessions, setSessions] = useState([]);
  const [varkResult, setVarkResult] = useState(null);
  const [habitLog, setHabitLog] = useState({});
  const [ready, setReady] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setSessions(lsGet(KEYS.sessions) || []);
    setVarkResult(lsGet(KEYS.vark));
    setHabitLog(lsGet(KEYS.habits) || {});
    setReady(true);
  }, []);

  const saveSession = (session) => {
    const next = [...sessions, session];
    setSessions(next);
    lsSet(KEYS.sessions, next);
  };

  const logHabit = (date, habitIdx, val) => {
    const next = {
      ...habitLog,
      [date]: { ...(habitLog[date] || {}), [habitIdx]: val },
    };
    setHabitLog(next);
    lsSet(KEYS.habits, next);
  };

  const dominantVark = varkResult
    ? Object.entries(varkResult).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  const tabs = [
    { id: "log", label: "Log Session", icon: "📝" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "habits", label: "Habit Tracker", icon: "✅" },
  ];

  if (!ready) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.textMuted, fontSize: 14 }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',sans-serif", color: C.text }}>

      {/* ── Header ── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px" }}>

          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
              }}>🧠</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>StudyTracker</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>Know how you learn best</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* VARK badge */}
              {dominantVark && (
                <div style={{
                  padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: VARK_COLORS[dominantVark] + "22",
                  border: `1px solid ${VARK_COLORS[dominantVark]}44`,
                  color: VARK_COLORS[dominantVark],
                }}>
                  {VARK_ICONS[dominantVark]} {VARK_NAMES[dominantVark]} Learner
                </div>
              )}

              {/* Back to assessment */}
              <button
                onClick={() => router.push("/assessment")}
                style={{
                  padding: "7px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  cursor: "pointer", border: `1px solid ${C.border}`,
                  background: "transparent", color: C.textSoft,
                  transition: "all 0.15s",
                }}
              >
                ← Assessment
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, paddingTop: 12 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setPage(t.id)} style={{
                padding: "9px 18px", borderRadius: "10px 10px 0 0", border: "none",
                background: page === t.id ? C.card : "transparent",
                color: page === t.id ? C.text : C.textMuted,
                fontSize: 12, fontWeight: page === t.id ? 700 : 500,
                cursor: "pointer", transition: "all 0.15s",
                borderTop: page === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page content ── */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "32px 24px 100px" }}>
        {page === "log" && <LogPage onSave={saveSession} sessions={sessions} />}
        {page === "analytics" && <AnalyticsPage sessions={sessions} />}
        {page === "habits" && <HabitsPage varkResult={varkResult} habitLog={habitLog} onLogHabit={logHabit} />}
      </div>
    </div>
  );
}