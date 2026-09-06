"use client";
import { useState } from "react";
import { Problem, useApp } from "@/context/AppContext";

const SUBJECT_STYLE: Record<string, { badge: string }> = {
  Math:     { badge: "bg-blue-100 text-blue-700" },
  Science:  { badge: "bg-green-100 text-green-700" },
  English:  { badge: "bg-orange-100 text-orange-700" },
  History:  { badge: "bg-purple-100 text-purple-700" },
  Computer: { badge: "bg-pink-100 text-pink-700" },
};

const DIFF_STYLE: Record<string, string> = {
  Easy:   "bg-green-50 text-green-600 border border-green-200",
  Medium: "bg-amber-50 text-amber-600 border border-amber-200",
  Hard:   "bg-red-50 text-red-600 border border-red-200",
};

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface Props {
  problem: Problem;
  existingSubmission?: { isCorrect: boolean };
}

export function ProblemCard({ problem, existingSubmission }: Props) {
  const { submitAnswer } = useApp();
  const [answer, setAnswer] = useState("");
  const [hintsShown, setHintsShown] = useState(0);
  const [result, setResult] = useState<{ isCorrect: boolean; pointsEarned: number; solution: string } | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const isClosed = new Date(problem.closeAt) < new Date();
  const isOpen = !isClosed;
  const subStyle = SUBJECT_STYLE[problem.subject] ?? { badge: "bg-slate-100 text-slate-600" };
  const alreadyDone = !!existingSubmission || result !== null;

  // MCQ: problem has at least one non-empty option
  const hasOptions = problem.options?.some(o => o.trim() !== "");
  const filledOptions = hasOptions
    ? problem.options.map((text, i) => ({ label: OPTION_LABELS[i], text })).filter(o => o.text.trim())
    : [];

  const timeLeft = (() => {
    const diff = new Date(problem.closeAt).getTime() - Date.now();
    if (diff <= 0) return "Closed";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  })();

  function handleMCQSelect(label: string) {
    if (alreadyDone || !isOpen) return;
    setAnswer(label);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    const r = submitAnswer(problem.id, answer, hintsShown);
    setResult(r);
  }

  const correct = result?.isCorrect ?? existingSubmission?.isCorrect ?? false;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header strip */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${subStyle.badge}`}>{problem.subject}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${DIFF_STYLE[problem.difficulty]}`}>{problem.difficulty}</span>
        </div>
        <span className={`text-xs font-medium flex items-center gap-1 ${isClosed ? "text-slate-400" : "text-emerald-600"}`}>
          {isClosed ? "🔒 Closed" : `⏱ ${timeLeft}`}
        </span>
      </div>

      <div className="px-5 py-4">
        <h3 className="font-semibold text-slate-800 mb-2 text-base">{problem.title}</h3>
        <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{problem.body}</p>
      </div>

      {/* MCQ options */}
      {hasOptions && (
        <div className="px-5 pb-3 grid grid-cols-1 gap-2">
          {filledOptions.map(({ label, text }) => {
            const isSelected = answer === label;
            const isCorrectOption = (result || isClosed) && problem.answer.toUpperCase() === label;
            const isWrongSelected = result && !result.isCorrect && isSelected;

            let optStyle = "border-slate-200 text-slate-700 bg-slate-50 hover:border-blue-300 hover:bg-blue-50";
            if (alreadyDone || isClosed) {
              if (isCorrectOption) optStyle = "border-green-400 bg-green-50 text-green-800";
              else if (isWrongSelected) optStyle = "border-red-300 bg-red-50 text-red-700";
              else optStyle = "border-slate-200 text-slate-400 bg-slate-50";
            } else if (isSelected) {
              optStyle = "border-blue-500 bg-blue-50 text-blue-800";
            }

            return (
              <button
                key={label}
                type="button"
                disabled={alreadyDone || !isOpen}
                onClick={() => handleMCQSelect(label)}
                className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all disabled:cursor-default ${optStyle}`}
              >
                <span className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md text-xs font-bold border ${
                  isCorrectOption ? "bg-green-500 text-white border-green-500" :
                  isWrongSelected ? "bg-red-400 text-white border-red-400" :
                  isSelected ? "bg-blue-600 text-white border-blue-600" :
                  "bg-white text-slate-500 border-slate-300"
                }`}>
                  {label}
                </span>
                {text}
              </button>
            );
          })}
        </div>
      )}

      {/* Hints */}
      {!alreadyDone && isOpen && problem.hints.length > 0 && (
        <div className="px-5 pb-2 space-y-2">
          {problem.hints.slice(0, hintsShown).map((h, i) => (
            <div key={i} className="flex gap-2 text-xs bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-amber-700">
              <span>💡</span><span><strong>Hint {i + 1}:</strong> {h}</span>
            </div>
          ))}
          {hintsShown < problem.hints.length && (
            <button onClick={() => setHintsShown(h => h + 1)} className="text-xs text-amber-600 hover:text-amber-800 font-medium hover:underline">
              Use hint {hintsShown + 1} <span className="text-slate-400">(−3 pts)</span>
            </button>
          )}
        </div>
      )}

      {/* Answer area */}
      <div className="px-5 pb-5">
        {!alreadyDone && isOpen ? (
          <form onSubmit={submit} className={hasOptions ? "mt-1" : "flex gap-2 mt-1"}>
            {!hasOptions && (
              <input
                value={answer} onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer…"
                className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            )}
            <button
              type="submit"
              disabled={!answer.trim()}
              className={`${hasOptions ? "w-full mt-2" : ""} px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-sm`}
            >
              {hasOptions ? (answer ? `Submit — Option ${answer}` : "Select an option") : "Submit"}
            </button>
          </form>
        ) : alreadyDone ? (
          <div className={`mt-1 rounded-xl px-4 py-3 flex items-center justify-between text-sm font-medium ${correct ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            <span>{correct ? `✅ Correct!${result ? ` +${result.pointsEarned} pts` : ""}` : "❌ Incorrect"}</span>
            {(result || isClosed) && (
              <button onClick={() => setShowSolution(s => !s)} className="text-xs underline opacity-60 hover:opacity-100">
                {showSolution ? "Hide" : "See"} solution
              </button>
            )}
          </div>
        ) : (
          <div className="mt-1 rounded-xl px-4 py-3 text-sm text-slate-400 bg-slate-50 border border-slate-100">
            🔒 Submissions closed
            <button onClick={() => setShowSolution(s => !s)} className="ml-3 text-xs underline text-slate-500 hover:text-slate-700">
              {showSolution ? "Hide" : "See"} solution
            </button>
          </div>
        )}

        {showSolution && (result?.solution || problem.solution) && (
          <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-800 leading-relaxed">
            📖 {result?.solution ?? problem.solution}
          </div>
        )}
      </div>
    </div>
  );
}
