"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@/app/context/AppContext";
import ReactMarkdown from "react-markdown";

const BACKEND_BASE_URL = "http://localhost:8000";

const STYLE_ENDPOINTS = {
  Visual: "/api/youtube",
  Auditory: "/api/generate-audio",
  "Read/Write": "/api/generate-notes",
  Kinesthetic: "/api/generate-practice",
};

export default function ResourcesPage() {
  const { learningStyle } = useAppContext();

  const [topic, setTopic] = useState("");
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedResources, setSavedResources] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState("");
const [selectedResource, setSelectedResource] = useState(null);
  const style = learningStyle || "Visual";
  const hasAssessmentResult = Boolean(learningStyle);

  const headerCopy = useMemo(() => {
    if (style === "Visual") return "Video-first recommendations tailored for visual understanding.";
    if (style === "Auditory") return "Audio-style explanations generated for discussion and listening.";
    if (style === "Read/Write") return "Structured written notes optimized for reading and review.";
    return "Hands-on practice tasks generated to learn by doing.";
  }, [style]);

  const cleanText = (text) => {
  return text
    .replace(/[#*`]/g, "")
    .replace(/\n/g, " ");
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = speechSynthesis.getVoices();

    // 🔥 pick a better voice
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes("Google") || 
        voice.name.includes("Samantha") ||
        voice.name.includes("Alex")
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
  speechSynthesis.cancel();
};
  const fetchSavedResources = async () => {
    setSavedLoading(true);
    setSavedError("");

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/resources`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to fetch saved resources");
      }

      setSavedResources(Array.isArray(data) ? data : []);
    } catch (error) {
      setSavedError(error.message || "Failed to fetch saved resources");
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedResources();
  }, []);

  const saveGeneratedResource = async (contentToSave) => {
    if (!topic.trim()) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          learning_style: style,
          content: contentToSave,
          type: style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to save generated resource");
      }

      await fetchSavedResources();
    } catch (error) {
      setSavedError(error.message || "Failed to save generated resource");
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      return;
    }

    setLoading(true);
    setResources([]);
    setNotes("");

    try {
      const endpoint = STYLE_ENDPOINTS[style];
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (style === "Visual") {
        const videos = Array.isArray(data) ? data : [];
        setResources(videos);
        await saveGeneratedResource(JSON.stringify(videos));
      } else if (style === "Auditory") {
        const generatedNotes = data?.audioText || "";
        setNotes(generatedNotes);
        await saveGeneratedResource(generatedNotes);
      } else if (style === "Read/Write") {
        const generatedNotes = data?.notes || "";
        setNotes(generatedNotes);
        await saveGeneratedResource(generatedNotes);
      } else {
        const generatedNotes = data?.tasks || "";
        setNotes(generatedNotes);
        await saveGeneratedResource(generatedNotes);
      }
    } catch (error) {
      console.error("Error generating resources:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <aside className="hidden w-64 rounded-2xl border border-border bg-card p-6 md:block">
          <h2 className="mb-6 text-xl font-semibold text-white">Learning Hub</h2>

          <nav className="flex flex-col gap-3 text-slate-300">
            <a href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-slate-800">Dashboard</a>
            <a href="/assessment/instructions" className="rounded-lg px-3 py-2 hover:bg-slate-800">Assessment</a>
            <a href="/analysis" className="rounded-lg px-3 py-2 hover:bg-slate-800">Analysis</a>
            <a href="/results" className="rounded-lg px-3 py-2 hover:bg-slate-800">Results</a>
            <a href="/resources" className="rounded-lg bg-accent px-3 py-2 text-white">Resources</a>
          </nav>
        </aside>

        <main className="flex-1">
          <div className="mb-6 rounded-2xl border border-border bg-card p-6">
            <h1 className="text-3xl font-semibold text-white">Smart Resources</h1>
            <p className="mt-2 text-slate-300">
              Personalized for: <span className="font-semibold text-white">{style}</span> learner
            </p>
            <p className="mt-2 text-sm text-slate-400">{headerCopy}</p>
            {!hasAssessmentResult ? (
              <p className="mt-3 rounded-lg border border-amber-700/70 bg-amber-900/20 px-3 py-2 text-sm text-amber-300">
                No learning style found yet. Showing a safe default (Visual) until you complete the assessment.
              </p>
            ) : null}
          </div>

          <div className="mb-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <input
                type="text"
                placeholder="Enter topic (e.g., Binary Trees)"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="flex-1 rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-accent"
              />

              <button
                onClick={handleGenerate}
                className="rounded-xl bg-accent px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
              >
                Generate Resources
              </button>
            </div>
          </div>

          {loading ? <p className="text-slate-300">Loading content...</p> : null}

          {style === "Visual" && resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((video, index) => (
                <div key={video.videoId || index} className="rounded-xl border border-border bg-card p-4">
                  <img
                    src={video.thumbnail}
                    alt="video thumbnail"
                    className="mb-3 h-40 w-full rounded-lg object-cover"
                  />
                  <h3 className="mb-2 text-sm font-semibold text-white">{video.title}</h3>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-300 hover:text-indigo-200"
                  >
                    Watch Video
                  </a>
                </div>
              ))}
            </div>
          ) : null}

          {style === "Read/Write" && notes ? (
            <div className="whitespace-pre-wrap rounded-xl border border-border bg-card p-6 text-slate-200">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          ) : null}

          {style === "Auditory" && notes ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Audio Lecture Explanation</h2>
              <div className="mb-4 whitespace-pre-wrap text-slate-200">
                <ReactMarkdown>{notes}</ReactMarkdown>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => speak(cleanText(notes))}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500"
                >
                  Listen
                </button>

                <button
                  onClick={stopSpeaking}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-500"
                >
                  Stop
                </button>
              </div>
            </div>
          ) : null}

          {style === "Kinesthetic" && notes ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Practice Tasks</h2>
              <div className="whitespace-pre-wrap text-slate-200">
                <ReactMarkdown>{notes}</ReactMarkdown>
              </div>
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-white">Saved Resources</h2>

            {savedLoading ? <p className="mt-3 text-slate-300">Loading saved resources...</p> : null}
            {savedError ? <p className="mt-3 text-rose-300">{savedError}</p> : null}

            {!savedLoading && savedResources.length === 0 ? (
              <p className="mt-3 text-slate-300">No saved resources yet.</p>
            ) : null}

            {savedResources.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {savedResources.map((item) => (
                    <li
                    key={item.id}
                    onClick={() => setSelectedResource(item)}
                    className="cursor-pointer rounded-xl border border-slate-700 bg-slate-900/50 p-4 hover:bg-slate-800 transition"
                    >
                    <p className="text-sm font-semibold text-white">{item.topic}</p>
                    <p className="text-xs text-slate-400">
                        {item.learning_style} • {item.type}
                    </p>
                    </li>

                ))}

                {selectedResource && (
                    <div className="mt-6 rounded-2xl border border-border bg-card p-6">

                        <button
                        onClick={() => setSelectedResource(null)}
                        className="mb-4 text-indigo-400 hover:underline"
                        >
                        ← Back
                        </button>

                        <h2 className="text-xl font-semibold text-white mb-2">
                        {selectedResource.topic}
                        </h2>

                        <p className="text-sm text-slate-400 mb-4">
                        {selectedResource.learning_style} • {selectedResource.type}
                        </p>

                        {/* VISUAL */}
                        {selectedResource.type === "Visual" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {JSON.parse(selectedResource.content || "[]").map((video, i) => (
                            <a
                                key={i}
                                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                target="_blank"
                                className="block border border-slate-700 rounded-lg p-3 hover:bg-slate-800"
                            >
                                <img src={video.thumbnail} className="rounded mb-2" alt=""/>
                                <p className="text-sm text-white">{video.title}</p>
                            </a>
                            ))}
                        </div>
                        ) : (
                        <div className="prose prose-invert max-w-none text-slate-200">
                    <ReactMarkdown>
                        {selectedResource.content}
                    </ReactMarkdown>
                    </div>
                        )}
                    </div>
                    )}
                </ul>
                
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
