"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SUBJECTS = ["MATH","SCIENCE","ENGLISH","HISTORY","GEOGRAPHY","COMPUTER"];
const DIFFICULTIES = ["EASY","MEDIUM","HARD"];

export function ProblemForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", body: "", subject: "MATH", difficulty: "MEDIUM",
    hint1: "", hint2: "", hint3: "", solution: "",
    publishAt: "", closeAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { setError("Failed to create problem. Check all fields."); return; }
    router.push("/teacher");
  }

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
      <div>
        <label className={labelCls}>Title</label>
        <input required className={inputCls} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Quadratic Equations — Day 1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Subject</label>
          <select className={inputCls} value={form.subject} onChange={e => set("subject", e.target.value)}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Difficulty</label>
          <select className={inputCls} value={form.difficulty} onChange={e => set("difficulty", e.target.value)}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Problem Statement (supports LaTeX with $…$)</label>
        <textarea required rows={5} className={inputCls} value={form.body} onChange={e => set("body", e.target.value)} placeholder="e.g. Solve for x: $x^2 - 5x + 6 = 0$" />
      </div>

      <div>
        <label className={labelCls}>Solution (exact answer students must match)</label>
        <input required className={inputCls} value={form.solution} onChange={e => set("solution", e.target.value)} placeholder="e.g. x = 2 or x = 3" />
      </div>

      <div className="space-y-2">
        <label className={labelCls}>Hints (optional — each costs students 3 points)</label>
        {["hint1","hint2","hint3"].map((h, i) => (
          <input key={h} className={inputCls} value={(form as any)[h]} onChange={e => set(h, e.target.value)} placeholder={`Hint ${i + 1}…`} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Publish At</label>
          <input required type="datetime-local" className={inputCls} value={form.publishAt} onChange={e => set("publishAt", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Close At</label>
          <input required type="datetime-local" className={inputCls} value={form.closeAt} onChange={e => set("closeAt", e.target.value)} />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
          {loading ? "Creating…" : "Create Problem"}
        </button>
      </div>
    </form>
  );
}
