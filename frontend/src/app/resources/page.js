"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

const BACKEND_BASE_URL = "http://localhost:8000";

const STYLE_ENDPOINTS = {
  Visual: "/api/youtube",
  Auditory: "/api/generate-audio",
  "Read/Write": "/api/generate-notes",
  Kinesthetic: "/api/generate-practice",
};

export default function ResourcesPage() {
  // 🔥 LOCAL STORAGE STYLE
  const [style, setStyle] = useState(null);

  const [topic, setTopic] = useState("");
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedResources, setSavedResources] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);

  // 🔥 GET STYLE FROM LOCAL STORAGE
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vark_scores");

      if (stored) {
        const parsed = JSON.parse(stored);

        const sorted = Object.entries(parsed).sort((a, b) => b[1] - a[1]);
        const dominant = sorted[0][0];

        const map = {
          V: "Visual",
          A: "Auditory",
          R: "Read/Write",
          K: "Kinesthetic",
        };

        setStyle(map[dominant]);
      }
    } catch (e) {
      console.error("Error reading localStorage", e);
    }
  }, []);

  const finalStyle = style || "Visual";
  const hasAssessmentResult = Boolean(style);

  const headerCopy = useMemo(() => {
    if (finalStyle === "Visual") return "Video-first recommendations tailored for visual understanding.";
    if (finalStyle === "Auditory") return "Audio-style explanations generated for discussion and listening.";
    if (finalStyle === "Read/Write") return "Structured written notes optimized for reading and review.";
    return "Hands-on practice tasks generated to learn by doing.";
  }, [finalStyle]);

  const cleanText = (text) => {
    return text.replace(/[#*`]/g, "").replace(/\n/g, " ");
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();

    const preferredVoice =
      voices.find((v) => v.name.includes("Google")) ||
      voices.find((v) => v.name.includes("Samantha")) ||
      voices.find((v) => v.name.includes("Alex")) ||
      voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => speechSynthesis.cancel();

  const fetchSavedResources = async () => {
    setSavedLoading(true);
    setSavedError("");

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/resources`);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.detail || "Failed");

      setSavedResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setSavedError(err.message);
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedResources();
  }, []);

  const saveGeneratedResource = async (content) => {
    if (!topic.trim()) return;

    try {
      await fetch(`${BACKEND_BASE_URL}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          learning_style: finalStyle,
          content,
          type: finalStyle,
        }),
      });

      await fetchSavedResources();
    } catch (err) {
      setSavedError(err.message);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setResources([]);
    setNotes("");

    try {
      const endpoint = STYLE_ENDPOINTS[finalStyle];
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();

      if (finalStyle === "Visual") {
        setResources(Array.isArray(data) ? data : []);
        await saveGeneratedResource(JSON.stringify(data));
      } else {
        const content =
          data?.audioText || data?.notes || data?.tasks || "";
        setNotes(content);
        await saveGeneratedResource(content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* HEADER */}
        <div className="mb-6 p-6 bg-card rounded-2xl">
          <h1 className="text-3xl text-white font-semibold">Smart Resources</h1>

          {style ? (
            <p className="mt-2 text-white">
              Your Learning Style: <b>{finalStyle}</b>
            </p>
          ) : (
            <p className="text-yellow-400 mt-2">
              Please complete assessment first
            </p>
          )}

          <p className="text-sm text-slate-400 mt-2">{headerCopy}</p>
        </div>

        {/* INPUT */}
        <div className="mb-6 flex gap-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic"
            className="flex-1 p-3 rounded-xl bg-slate-900 text-white"
          />
          <button
            onClick={handleGenerate}
            className="bg-indigo-500 px-4 py-2 rounded-xl text-white"
          >
            Generate
          </button>
        </div>

        {/* CONTENT */}
        {loading && <p>Loading...</p>}

        {finalStyle === "Visual" && resources.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {resources.map((v, i) => (
              <a key={i} href={`https://youtube.com/watch?v=${v.videoId}`} target="_blank">
                <img src={v.thumbnail} />
                <p>{v.title}</p>
              </a>
            ))}
          </div>
        )}

        {finalStyle !== "Visual" && notes && (
          <div className="bg-card p-6 rounded-xl">
            <ReactMarkdown>{notes}</ReactMarkdown>

            {finalStyle === "Auditory" && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => speak(cleanText(notes))}>Listen</button>
                <button onClick={stopSpeaking}>Stop</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}