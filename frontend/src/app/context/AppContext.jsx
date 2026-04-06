"use client";

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";

const API_BASE_URL = "http://localhost:8000";
const DEFAULT_RESULT = {
  Visual: 0,
  Auditory: 0,
  "Read/Write": 0,
  Kinesthetic: 0,
};
const STORAGE_KEY = "learning-style-app-state";

const AppContext = createContext(null);

function normalizeStyleName(style) {
  if (style === "Reading/Writing") {
    return "Read/Write";
  }

  return style || null;
}

function normalizePercentages(raw) {
  const source = raw || {};

  if (Object.prototype.hasOwnProperty.call(source, "Visual")) {
    return {
      Visual: Number(source.Visual ?? 0),
      Auditory: Number(source.Auditory ?? 0),
      "Read/Write": Number(source["Read/Write"] ?? 0),
      Kinesthetic: Number(source.Kinesthetic ?? 0),
    };
  }

  return {
    Visual: Number(source.V ?? 0),
    Auditory: Number(source.A ?? 0),
    "Read/Write": Number(source.R ?? 0),
    Kinesthetic: Number(source.K ?? 0),
  };
}

function mapScheduleEntry(entry) {
  const startTime = entry?.start_time || entry?.startTime || null;
  const endTime = entry?.end_time || entry?.endTime || null;

  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;

  const duration =
    start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
      ? Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
      : Number(entry?.duration ?? 0);

  const date =
    start && !Number.isNaN(start.getTime())
      ? start.toISOString().slice(0, 10)
      : (entry?.date || new Date().toISOString().slice(0, 10));

  return {
    id: entry?.id,
    taskId: entry?.task_id ?? entry?.taskId ?? null,
    title: entry?.task_name || entry?.title || "Task",
    duration,
    date,
    startTime,
    endTime,
    status: entry?.status || "pending",
    priority: entry?.priority || "medium",
  };
}

function parseStoredState(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readInitialState() {
  if (typeof window === "undefined") {
    return {
      answers: [],
      result: { ...DEFAULT_RESULT },
      learningStyle: null,
      studySessions: [],
    };
  }

  const stored = parseStoredState(window.localStorage.getItem(STORAGE_KEY));

  if (!stored) {
    return {
      answers: [],
      result: { ...DEFAULT_RESULT },
      learningStyle: null,
      studySessions: [],
    };
  }

  return {
    answers: Array.isArray(stored.answers) ? stored.answers : [],
    result: normalizePercentages(stored?.result),
    learningStyle: normalizeStyleName(stored.learningStyle),
    studySessions: Array.isArray(stored.studySessions) ? stored.studySessions : [],
  };
}

export function AppProvider({ children }) {
  const [answers, setAnswers] = useState(() => readInitialState().answers);
  const [result, setResult] = useState(() => readInitialState().result);
  const [learningStyle, setLearningStyle] = useState(() => readInitialState().learningStyle);
  const [studySessions, setStudySessions] = useState(() => readInitialState().studySessions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ answers, result, learningStyle, studySessions }),
    );
  }, [answers, result, learningStyle, studySessions]);

  const submitAssessment = useCallback(async (numericAnswers) => {
    const safeAnswers = Array.isArray(numericAnswers) ? numericAnswers : [];

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: safeAnswers }),
      });

      const data = await response.json();

      if (!response.ok || data?.error) {
        throw new Error(data?.error || "Failed to predict learning style");
      }

      const percentages = normalizePercentages(data?.percentages);
      const dominant = normalizeStyleName(data?.dominant_style);

      setAnswers(safeAnswers);
      setResult(percentages);
      setLearningStyle(dominant);

      return data;
    } catch (err) {
      setError(err.message || "Failed to submit assessment");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSchedule = useCallback(async (startDate) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.set("start_date", startDate);
      }

      const url = params.toString()
        ? `${API_BASE_URL}/schedule?${params.toString()}`
        : `${API_BASE_URL}/schedule`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to fetch schedule");
      }

      const sessions = Array.isArray(data) ? data.map(mapScheduleEntry) : [];
      setStudySessions(sessions);
      return sessions;
    } catch (err) {
      setError(err.message || "Failed to fetch schedule");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (text, startDate) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to add task");
      }

      await fetchSchedule(startDate);
      return data;
    } catch (err) {
      setError(err.message || "Failed to add task");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedule]);

  const markTaskComplete = useCallback(async (entryId, startDate) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/schedule/${entryId}/complete`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to mark task complete");
      }

      await fetchSchedule(startDate);
      return data;
    } catch (err) {
      setError(err.message || "Failed to mark task complete");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedule]);

  const deleteTask = useCallback(async (taskId) => {
    if (!taskId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to delete task");
      }

      await fetchSchedule();
      return data;
    } catch (err) {
      setError(err.message || "Failed to delete task");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedule]);

  const addStudySession = useCallback(async (session) => {
  if (!session?.title) return;

  const durationMinutes = Number(session.duration || 0);
  const taskDate = session.date || new Date().toISOString().slice(0, 10);

  // 🔥 SIMPLE NLP-FRIENDLY FORMAT
  const taskText = `Study ${session.title} for ${durationMinutes} minutes on ${taskDate}`;

  await addTask(taskText, taskDate);
}, [addTask]);

  const value = useMemo(
    () => ({
      answers,
      result,
      learningStyle,
      studySessions,
      loading,
      error,
      setAnswers,
      setResult,
      setLearningStyle,
      setStudySessions,
      submitAssessment,
      addStudySession,
      fetchSchedule,
      addTask,
      markTaskComplete,
      deleteTask,
    }),
    [
      answers,
      result,
      learningStyle,
      studySessions,
      loading,
      error,
      submitAssessment,
      addStudySession,
      fetchSchedule,
      addTask,
      markTaskComplete,
      deleteTask,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
}
