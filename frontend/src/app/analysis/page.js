"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function AnalysisPage() {

  const data = {
    labels: ["Visual", "Auditory", "Reading", "Kinesthetic"],
    datasets: [
      {
        label: "Learning Style %",
        data: [40, 25, 20, 15],
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6">Learning Hub</h2>

        <nav className="flex flex-col gap-4 text-gray-700">
          <a href="/profile" className="hover:text-blue-600">Dashboard</a>
          <a href="/assessment" className="hover:text-blue-600">Assessment</a>
          <a href="/resources" className="hover:text-blue-600">Resources</a>
          <a href="/analysis" className="text-blue-600 font-semibold">Analysis</a>
          <a href="/result" className="hover:text-blue-600">Results</a>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            📊 Learning Style Analysis
          </h1>
          <p className="text-gray-600">
            Percentage distribution based on assessment responses.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <Bar data={data} options={options} />
        </div>

      </main>
    </div>
  );
}