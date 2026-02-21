"use client";

import { useState } from "react";

export default function ResourcesPage() {
  const [topic, setTopic] = useState("");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const learningStyle = "Visual"; // change to test others

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setResources([]);

    if (learningStyle === "Visual") {
        const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
        });

        const data = await res.json();
        setResources(data);
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
        {loading && <p>Loading videos...</p>}

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