"use client";

import { useRouter } from "next/navigation";
import { questions } from "../questions";

export default function InstructionsPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/assessment/questions");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-lg shadow-black/20">
        <h1 className="mb-4 text-3xl font-semibold text-white">Assessment Instructions</h1>
        <p className="mb-6 text-slate-300">
          Read each question and choose the option that best reflects how you naturally learn.
        </p>

        <ul className="mb-8 list-disc space-y-2 pl-5 text-slate-300">
          <li>There are {questions.length} questions in total.</li>
          <li>Answer honestly based on your real study behavior.</li>
          <li>Complete all questions to generate an accurate VARK analysis.</li>
          <li>You will see your analysis, results, and personalized resources after submission.</li>
        </ul>

        <button
          onClick={handleStart}
          className="rounded-xl bg-accent px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
        >
          Start Assessment
        </button>
      </div>
    </div>
  );
}
