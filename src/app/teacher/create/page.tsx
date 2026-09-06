"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import type { Subject, Difficulty } from "@/context/AppContext";

const SUBJECTS: Subject[] = ["Math", "Science", "English", "History", "Computer"];
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

const SUBJECT_STYLE: Record<Subject, string> = {
  Math:     "border-blue-300 bg-blue-50 text-blue-700",
  Science:  "border-green-300 bg-green-50 text-green-700",
  English:  "border-orange-300 bg-orange-50 text-orange-700",
  History:  "border-purple-300 bg-purple-50 text-purple-700",
  Computer: "border-pink-300 bg-pink-50 text-pink-700",
};

const DIFF_STYLE: Record<Difficulty, string> = {
  Easy:   "border-green-300 bg-green-50 text-green-700",
  Medium: "border-amber-300 bg-amber-50 text-amber-700",
  Hard:   "border-red-300 bg-red-50 text-red-700",
};

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

function defaultPublish() {
  const d = new Date(); d.setMinutes(0, 0, 0); d.setHours(d.getHours() + 1);
  return d.toISOString().slice(0, 16);
}
function defaultClose() {
  const d = new Date(); d.setMinutes(0, 0, 0); d.setHours(d.getHours() + 25);
  return d.toISOString().slice(0, 16);
}

function CreateProblemForm() {
  const { user, hydrated, createProblem } = useApp();
  const router = useRouter();
  const params = useSearchParams();

  const [subject, setSubject]     = useState<Subject>((params.get("subject") as Subject) ?? "Math");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [title, setTitle]         = useState("");
  const [body, setBody]           = useState("");
  const [options, setOptions]     = useState<[string,string,string,string]>(["","","",""]);
  const [answer, setAnswer]       = useState("");
  const [solution, setSolution]   = useState("");
  const [hints, setHints]         = useState(["", "", ""]);
  const [publishAt, setPublishAt] = useState(defaultPublish);
  const [closeAt, setCloseAt]     = useState(defaultClose);
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState<string[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role === "student") router.replace("/student");
  }, [hydrated, user, router]);

  const hasOptions = options.some(o => o.trim() !== "");

  function setOption(i: number, val: string) {
    setOptions(prev => { const next = [...prev] as [string,string,string,string]; next[i] = val; return next; });
  }

  function validate() {
    const e: string[] = [];
    if (!title.trim()) e.push("Title is required");
    if (!body.trim()) e.push("Problem statement is required");
    if (!answer.trim()) e.push("Answer is required");
    if (hasOptions) {
      const filled = options.filter(o => o.trim());
      if (filled.length < 2) e.push("Add at least 2 options if using MCQ");
      const validLabels = options.map((o, i) => o.trim() ? OPTION_LABELS[i] : null).filter(Boolean);
      if (!validLabels.includes(answer.toUpperCase() as any)) e.push(`Answer must be one of the filled option labels (${validLabels.join(", ")})`);
    }
    if (!solution.trim()) e.push("Solution/explanation is required");
    if (!publishAt || !closeAt) e.push("Schedule is required");
    if (closeAt <= publishAt) e.push("Close time must be after publish time");
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      createProblem({
        title: title.trim(), body: body.trim(), subject, difficulty,
        hints: hints.map(h => h.trim()).filter(Boolean),
        options,
        answer: answer.trim(),
        solution: solution.trim(),
        publishAt: new Date(publishAt).toISOString(),
        closeAt: new Date(closeAt).toISOString(),
      });
      window.location.href = "/teacher";
    } catch (err) {
      console.error("Failed to publish problem:", err);
      setErrors(["Something went wrong. Please try again."]);
      setSaving(false);
    }
  }

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";
  const pts = difficulty === "Hard" ? 30 : difficulty === "Medium" ? 20 : 10;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 text-sm">← Back</button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Create New Problem</h1>
            <p className="text-sm text-slate-500 mt-0.5">Students will see it when it goes live</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Category */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-xs uppercase tracking-wide text-slate-400">Category</h2>
            <div>
              <label className={labelCls}>Subject</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button key={s} type="button" onClick={() => setSubject(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${subject === s ? SUBJECT_STYLE[s] : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Difficulty <span className="text-slate-400 font-normal">(affects points)</span></label>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d} type="button" onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${difficulty === d ? DIFF_STYLE[d] : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                    {d} <span className="font-normal opacity-60">({d === "Hard" ? 30 : d === "Medium" ? 20 : 10}pts)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Problem */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-xs uppercase tracking-wide text-slate-400">Problem</h2>
            <div>
              <label className={labelCls}>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="e.g. Quadratic Equations — Day 3" />
            </div>
            <div>
              <label className={labelCls}>Problem Statement</label>
              <textarea rows={5} value={body} onChange={e => setBody(e.target.value)}
                className={inputCls + " resize-none leading-relaxed"}
                placeholder={"Write the question clearly.\nYou can use equations like x² – 5x + 6 = 0"} />
            </div>

            {/* ── MCQ Options ── */}
            <div>
              <label className={labelCls}>
                Options <span className="text-slate-400 font-normal text-xs">(leave all empty for open-ended questions)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {OPTION_LABELS.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-bold border-2 transition-all ${options[i].trim() ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                      {label}
                    </span>
                    <input
                      value={options[i]}
                      onChange={e => setOption(i, e.target.value)}
                      className={inputCls}
                      placeholder={`Option ${label} (optional)`}
                    />
                  </div>
                ))}
              </div>
              {hasOptions && (
                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <span>ℹ️</span> MCQ mode — students will see clickable option buttons
                </p>
              )}
            </div>

            {/* Answer */}
            <div>
              <label className={labelCls}>
                Correct Answer
                {hasOptions
                  ? <span className="text-slate-400 font-normal text-xs ml-2">Enter the option letter (A, B, C, or D)</span>
                  : <span className="text-slate-400 font-normal text-xs ml-2">Exact text students must enter</span>
                }
              </label>
              {hasOptions ? (
                <div className="flex gap-2">
                  {OPTION_LABELS.map((label, i) => options[i].trim() ? (
                    <button key={label} type="button"
                      onClick={() => setAnswer(label)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${answer === label ? "bg-green-600 text-white border-green-600" : "border-slate-200 text-slate-600 hover:border-green-300"}`}>
                      {label}
                    </button>
                  ) : null)}
                </div>
              ) : (
                <input value={answer} onChange={e => setAnswer(e.target.value)} className={inputCls} placeholder="e.g. 2, 3 or inertia" />
              )}
            </div>

            <div>
              <label className={labelCls}>Solution / Explanation <span className="text-xs text-slate-400 font-normal">(shown after close)</span></label>
              <textarea rows={3} value={solution} onChange={e => setSolution(e.target.value)}
                className={inputCls + " resize-none"} placeholder="Step-by-step explanation..." />
            </div>
          </div>

          {/* Hints */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xs uppercase tracking-wide text-slate-400">Hints</h2>
              <span className="text-xs text-slate-400">Each hint costs student 3 pts</span>
            </div>
            {hints.map((h, i) => (
              <div key={i}>
                <label className="block text-xs font-medium text-slate-500 mb-1">Hint {i + 1} <span className="font-normal">(optional)</span></label>
                <input value={h} onChange={e => setHints(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                  className={inputCls} placeholder="Give a clue without revealing the answer…" />
              </div>
            ))}
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-xs uppercase tracking-wide text-slate-400">Schedule</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Publish At</label>
                <input type="datetime-local" value={publishAt} onChange={e => setPublishAt(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Close At</label>
                <input type="datetime-local" value={closeAt} onChange={e => setCloseAt(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-500">
              📋 Correct answer with no hints = <strong className="text-slate-700">{pts} pts</strong>. Solution visible after close.
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
              {errors.map(err => <p key={err} className="text-sm text-red-600 flex items-center gap-2"><span>⚠️</span>{err}</p>)}
            </div>
          )}

          <div className="flex gap-3 pb-4">
            <button type="button" onClick={() => router.back()}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
              {saving ? "Publishing…" : "Publish Problem"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateProblemPage() {
  return (
    <Suspense>
      <CreateProblemForm />
    </Suspense>
  );
}
