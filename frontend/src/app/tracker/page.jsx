"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@/app/context/AppContext";

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

  // ✅ Fetch only once on mount
  useEffect(() => {
    fetchSchedule().catch(() => {});
  }, []);

  // Sort sessions
  const sessions = useMemo(() => {
    return [...studySessions].sort((a, b) => {
      const left = a.startTime || a.date;
      const right = b.startTime || b.date;
      return new Date(right) - new Date(left);
    });
  }, [studySessions]);

  // FIXED SUBMIT (NO DUPLICATES)
  const handleSubmit = async (event) => {
    event.preventDefault();

    // prevent spam / double execution
    if (loading) return;

    if (!title.trim() || !duration || !date) return;

    try {
      await addStudySession({
        title: title.trim(),
        duration: Number(duration),
        date,
      });


      setTitle("");
      setDuration("");
    } catch {}
  };

  const handleComplete = async (session) => {
    if (!session?.taskId || session.status === "completed") return;

    try {
      await deleteTask(session.taskId);
    } catch {}
  };

  const handleDelete = async (session) => {
    if (!session?.taskId) return;

    try {
      await deleteTask(session.taskId);
    } catch {}
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">

        {/* FORM */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
          <h1 className="text-2xl font-semibold text-white">Study Tracker</h1>
          <p className="mt-2 text-slate-300">
            Log sessions to build your learning history.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Session Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: DSA revision"
                className="w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Session"}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-rose-300">{error}</p>
          )}
        </section>

        {/* LIST */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
          <h2 className="text-xl font-semibold text-white">
            Logged Sessions
          </h2>

          {sessions.length === 0 ? (
            <p className="mt-4 text-slate-300">
              No sessions yet. Add your first study session.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {sessions.map((session) => (
                <article
                  key={session.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-white">
                      {session.title}
                    </h3>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(session)}
                        disabled={loading || session.status === "completed"}
                        className="rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                      >
                        {session.status === "completed"
                          ? "Completed"
                          : "Mark Complete"}
                      </button>

                      <button
                        onClick={() => handleDelete(session)}
                        disabled={loading || !session.taskId}
                        className="rounded-lg border border-rose-700 px-2 py-1 text-xs text-rose-200 hover:bg-rose-900/30 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="mt-1 text-sm text-slate-300">
                    {session.duration} minutes
                  </p>
                  <p className="text-sm text-slate-400">
                    {session.date}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}