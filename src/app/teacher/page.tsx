"use client";
import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { format } from "date-fns";

const SUBJECT_BADGE: Record<string, string> = {
  Math:     "bg-blue-100 text-blue-700",
  Science:  "bg-green-100 text-green-700",
  English:  "bg-orange-100 text-orange-700",
  History:  "bg-purple-100 text-purple-700",
  Computer: "bg-pink-100 text-pink-700",
};

const DIFF_COLOR: Record<string, string> = {
  Easy:   "text-green-600",
  Medium: "text-amber-600",
  Hard:   "text-red-600",
};

export default function TeacherPage() {
  const { user, hydrated, problems, submissions, deleteProblem } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role === "student") router.replace("/student");
  }, [hydrated, user, router]);

  const now = new Date();

  // Only show problems this teacher created
  const myProblems = useMemo(() =>
    problems.filter(p => p.createdBy === user?.id),
    [problems, user]
  );

  const stats = useMemo(() => {
    const active = myProblems.filter(p => new Date(p.publishAt) <= now && new Date(p.closeAt) > now).length;
    const totalSubs = submissions.length;
    const correct = submissions.filter(s => s.isCorrect).length;
    return {
      total: myProblems.length,
      active,
      totalSubs,
      accuracy: totalSubs ? Math.round(correct / totalSubs * 100) : 0,
    };
  }, [myProblems, submissions]);

  const subsByProblem = useMemo(() => {
    const map: Record<string, number> = {};
    submissions.forEach(s => { map[s.problemId] = (map[s.problemId] ?? 0) + 1; });
    return map;
  }, [submissions]);

  const correctByProblem = useMemo(() => {
    const map: Record<string, number> = {};
    submissions.filter(s => s.isCorrect).forEach(s => { map[s.problemId] = (map[s.problemId] ?? 0) + 1; });
    return map;
  }, [submissions]);

  const mySubsByProblem = useMemo(() => {
    const myIds = new Set(myProblems.map(p => p.id));
    return Object.fromEntries(Object.entries(subsByProblem).filter(([id]) => myIds.has(id)));
  }, [subsByProblem, myProblems]);

  if (!hydrated) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-400 text-sm animate-pulse">Loading dashboard…</p>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-5 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user.name}</p>
          </div>
          <Link href="/teacher/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
            + New Problem
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Problems", value: stats.total,    icon: "📝" },
            { label: "Active Now",     value: stats.active,   icon: "🟢" },
            { label: "Submissions",    value: stats.totalSubs, icon: "✍️" },
            { label: "Avg Accuracy",   value: `${stats.accuracy}%`, icon: "🎯" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Note about auto-cleanup */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 mb-5">
          <span>🗑️</span>
          <span>Problems older than 2 days are automatically removed.</span>
        </div>

        {/* Problem list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">My Problems</h2>
            <span className="text-xs text-slate-400">{myProblems.length} total</span>
          </div>

          {myProblems.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="text-4xl mb-3">✏️</div>
              <p className="font-semibold text-slate-700">No problems yet</p>
              <p className="text-sm text-slate-400 mt-1">Create your first problem to get started</p>
              <Link href="/teacher/create" className="inline-block mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl">
                Create Problem
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myProblems.map(p => {
                const isActive  = new Date(p.publishAt) <= now && new Date(p.closeAt) > now;
                const isPending = new Date(p.publishAt) > now;
                const subs    = subsByProblem[p.id] ?? 0;
                const correct = correctByProblem[p.id] ?? 0;

                return (
                  <div key={p.id} className="px-5 py-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SUBJECT_BADGE[p.subject] ?? "bg-slate-100 text-slate-600"}`}>{p.subject}</span>
                          <span className={`text-xs font-semibold ${DIFF_COLOR[p.difficulty]}`}>{p.difficulty}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? "bg-green-100 text-green-700" : isPending ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                            {isActive ? "● Live" : isPending ? "Scheduled" : "Closed"}
                          </span>
                        </div>
                        <p className="font-medium text-slate-800 text-sm">{p.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {format(new Date(p.publishAt), "MMM d, h:mm a")} → {format(new Date(p.closeAt), "h:mm a")}
                        </p>
                      </div>

                      <div className="flex items-center gap-5 flex-shrink-0 text-right">
                        <div>
                          <div className="text-sm font-bold text-slate-800">{subs}</div>
                          <div className="text-xs text-slate-400">submissions</div>
                        </div>
                        {subs > 0 && (
                          <div>
                            <div className="text-sm font-bold text-green-600">{Math.round(correct / subs * 100)}%</div>
                            <div className="text-xs text-slate-400">correct</div>
                          </div>
                        )}
                        <button
                          onClick={() => deleteProblem(p.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
