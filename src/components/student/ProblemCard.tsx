"use client";
import { useState } from "react";
import { Problem } from "@/types";
import { SUBJECT_META, DIFFICULTY_META } from "@/types";
import { isOpen } from "@/lib/utils";

interface Props {
  problem: Problem;
  submitted: boolean;
  isCorrect: boolean;
}

export function ProblemCard({ problem, submitted, isCorrect }: Props) {
  const [answer, setAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [result, setResult] = useState<{ isCorrect: boolean; pointsEarned: number; solution: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const subject = SUBJECT_META[problem.subject];
  const difficulty = DIFFICULTY_META[problem.difficulty];
  const open = isOpen(problem.closeAt);
  const hints = [problem.hint1, problem.hint2, problem.hint3].filter(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    setLoading(true);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId: problem.id, answer, hintsUsed }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setResult(data);
  }

  const alreadyDone = submitted || result !== null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: subject.bg, color: subject.color }}>
            {subject.label}
          </span>
          <span className="text-xs font-semibold" style={{ color: difficulty.color }}>
            {difficulty.label}
          </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${open ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
          {open ? "Open" : "Closed"}
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">{problem.title}</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{problem.body}</p>
      </div>

      {/* Hints */}
      {!alreadyDone && open && hints.length > 0 && (
        <div className="px-6 pb-2">
          {hints.slice(0, hintsUsed).map((h, i) => (
            <div key={i} className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg px-3 py-2 mb-2">
              💡 Hint {i + 1}: {h}
            </div>
          ))}
          {hintsUsed < hints.length && (
            <button
              onClick={() => setHintsUsed(h => h + 1)}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              Use hint {hintsUsed + 1} (−3 pts)
            </button>
          )}
        </div>
      )}

      {/* Submission */}
      <div className="px-6 pb-6">
        {!alreadyDone && open ? (
          <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <input
              value={answer} onChange={e => setAnswer(e.target.value)}
              placeholder="Your answer…"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit" disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {loading ? "…" : "Submit"}
            </button>
          </form>
        ) : (
          <div className={`mt-2 rounded-lg px-4 py-3 text-sm font-medium ${
            (result?.isCorrect ?? isCorrect)
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
          }`}>
            {(result?.isCorrect ?? isCorrect) ? `✅ Correct! +${result?.pointsEarned ?? 0} pts` : "❌ Incorrect"}
            {!open && (
              <button onClick={() => setShowSolution(s => !s)} className="ml-3 underline text-xs">
                {showSolution ? "Hide" : "See"} solution
              </button>
            )}
          </div>
        )}

        {showSolution && (
          <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-3 text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
            <span className="font-semibold">Solution: </span>{problem.solution}
          </div>
        )}
      </div>
    </div>
  );
}
