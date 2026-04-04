"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";


export default function InstructionsPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/assessment"); 
  };

  return (
    <>
      <Navbar />

      <div className="p-8 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Assessment Instructions</h1>
        <p className="mb-6 text-left">
          Welcome to the Learning Style Assessment! Please read the instructions carefully before starting:
        </p>

        <ul className="list-disc text-left mb-6 ml-6 space-y-2">
          <li>There are 15 questions in total.</li>
          <li>Answer each question honestly.</li>
          <li>Make sure to answer all questions before submitting.</li>
          <li>
            Your responses will determine your learning style (Visual, Auditory,
            Reading/Writing, Kinesthetic).
          </li>
          <li>Click the "Start Assessment" button when ready.</li>
        </ul>

        <button
          onClick={handleStart}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Start Assessment
        </button>
      </div>
    </>
  );

}
