"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "./questions";
import { useAppContext } from "@/app/context/AppContext";

export default function AssessmentPage() {
  const router = useRouter();
  const { submitAssessment } = useAppContext();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState(
    Array(questions.length).fill(null),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const currentQuestion = questions[currentIndex];
  const selectedOption = selectedIndexes[currentIndex];

  const progress = useMemo(
    () => ((currentIndex + 1) / questions.length) * 100,
    [currentIndex],
  );

  const isLastQuestion = currentIndex === questions.length - 1;
  const hasUnanswered = selectedIndexes.some((value) => value === null);

  const onSelect = (optionIndex) => {
    const next = [...selectedIndexes];
    next[currentIndex] = optionIndex;
    setSelectedIndexes(next);
  };

  const onNext = () => {
    if (selectedOption === null || isLastQuestion) {
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const onBack = () => {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex((prev) => prev - 1);
  };

  const onSubmit = () => {
    if (hasUnanswered || submitting) {
      return;
    }

    const STYLE_TO_ID = { V: 0, A: 1, R: 2, K: 3 };
    const numericAnswers = selectedIndexes.map((answerIndex, index) => {
      const style = questions[index].options[answerIndex].style;
      return STYLE_TO_ID[style];
    });

    setSubmitting(true);
    setSubmitError("");

    submitAssessment(numericAnswers)
      .then(() => {
        router.push("/analysis");
      })
      .catch((error) => {
        setSubmitError(error.message || "Unable to submit assessment");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">VARK Assessment</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Question {currentIndex + 1}</h1>
          </div>
          <p className="text-sm text-slate-300">{currentIndex + 1} / {questions.length}</p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
        {currentQuestion.stimulus ? (
          <p className="mb-4 rounded-xl border border-slate-700 bg-slate-800/60 p-3 text-sm text-slate-300">
            {currentQuestion.stimulus}
          </p>
        ) : null}

        <h2 className="mb-6 text-xl font-semibold text-white">{currentQuestion.question}</h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;

            return (
              <button
                key={option.text}
                type="button"
                onClick={() => onSelect(index)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-accent bg-indigo-500/10 text-white"
                    : "border-slate-700 bg-slate-900/50 text-slate-200 hover:border-slate-500"
                }`}
              >
                <span className="font-medium">{option.text}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={currentIndex === 0}
            className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>

          {!isLastQuestion ? (
            <button
              type="button"
              onClick={onNext}
              disabled={selectedOption === null}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={hasUnanswered || submitting}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          )}
        </div>

        {submitError ? <p className="mt-3 text-sm text-rose-300">{submitError}</p> : null}

        {isLastQuestion && hasUnanswered ? (
          <p className="mt-4 text-sm text-amber-300">Please answer all questions before submitting.</p>
        ) : null}
      </div>
    </div>
  );
}
