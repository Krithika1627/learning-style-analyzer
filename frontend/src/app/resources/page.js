"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function ResourcesPage() {
  const [topic, setTopic] = useState("");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const learningStyle = "Reading"; // change to test others


  // 🔹 Load voices properly
  useEffect(() => {
    speechSynthesis.getVoices();
  }, []);

  // 🔹 Clean text (removes markdown junk)
  const cleanText = (text) => {
    return text
      .replace(/[#*`]/g, "")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ");
  };

  // 🔹 Speak function (IMPROVED)
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(cleanText(text));

    const voices = speechSynthesis.getVoices();

    // 🔥 Try to pick best voice available
    const preferredVoice =
      voices.find((v) => v.name.includes("Samantha")) || // Mac best
      voices.find((v) => v.name.includes("Google")) ||
      voices.find((v) => v.name.includes("Alex")) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // 🔥 Better natural sound
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.lang = "en-US";

    speechSynthesis.cancel(); // stop previous
    speechSynthesis.speak(utterance);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setResources([]);
    setNotes("");

    try {
        if (learningStyle === "Visual") {
          const res = await fetch("/api/youtube", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
          });
    
          const data = await res.json();
          setResources(data);
        }
    
        if (learningStyle === "Reading") {
          const res = await fetch("/api/generate-notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
          });
    
          const data = await res.json();
          setNotes(data.notes);
        }

        if (learningStyle === "Auditory") {
          const res = await fetch("/api/generate-audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
          });
        
          const data = await res.json();
          setNotes(data.audioText);
        }

        if (learningStyle === "Kinesthetic") {
          const res = await fetch("/api/generate-practice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
          });
        
          const data = await res.json();
          setNotes(data.tasks);
        }
    
    } catch (error) {
        console.error("Error:", error);
    }

    setLoading(false);
};

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6">
          Learning Hub
        </h2>

        <nav className="flex flex-col gap-4 text-gray-700">
          <a href="/profile" className="hover:text-blue-600">Dashboard</a>
          <a href="/assessment" className="hover:text-blue-600">Assessment</a>
          <a href="/resources" className="text-blue-600 font-semibold">Resources</a>
          <a href="/result" className="hover:text-blue-600">Results</a>
        </nav>
      </aside>


      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            📚 Smart Resources
          </h1>
          <p className="text-gray-600">
            Personalized for: <span className="font-semibold">{learningStyle}</span> learner
          </p>
        </div>

        {/* SEARCH CARD */}
        <div className="bg-white p-6 rounded-lg shadow mb-10">

          <div className="flex flex-col md:flex-row gap-4">

            <input
              type="text"
              placeholder="Enter topic (e.g. DSA Trees)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 p-3 border rounded"
            />

            <button
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            >
              Generate Resources
            </button>

          </div>

        </div>

        {/* RESOURCE GRID */}
        {loading && <p>Loading content...</p>}

        {learningStyle === "Visual" && resources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((video, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
                <img
                src={video.thumbnail}
                alt="thumbnail"
                className="rounded mb-3"
                />
                <h3 className="font-semibold mb-2 text-sm">
                {video.title}
                </h3>
                <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                className="text-blue-600 text-sm"
                >
                Watch Video
                </a>
            </div>
            ))}
        </div>
        )}

        {learningStyle === "Reading" && notes && (
            <div className="bg-white p-6 rounded shadow whitespace-pre-wrap">
                <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
        )}
        
        {learningStyle === "Auditory" && notes && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              🎧 Lecture Explanation
            </h2>

            <div className="mb-4 whitespace-pre-wrap"><ReactMarkdown>{notes}</ReactMarkdown></div>

            <button
              onClick={() => speak(notes)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              🔊 Listen
            </button>

            <button
              onClick={() => speechSynthesis.cancel()}
              className="ml-3 bg-red-500 text-white px-4 py-2 rounded"
            >
              Stop
            </button>
          </div>
        )}

        {learningStyle === "Kinesthetic" && notes && (
          <div className="bg-white p-6 rounded shadow">
            
            <h2 className="text-xl font-semibold mb-4">
              🧪 Practice Tasks
            </h2>

            <p className="whitespace-pre-wrap mb-4">
            <ReactMarkdown>{notes}</ReactMarkdown>
            </p>

          </div>
        )}

      </main>
    </div>
  );
}


function ResourceCard({ title, description, badge }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
          {badge}
        </span>
      </div>

      <p className="text-gray-600 mb-5">{description}</p>

      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
        Open Resource
      </button>

    </div>
  );
}