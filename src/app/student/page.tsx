"use client";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { ProblemCard } from "@/components/ProblemCard";

export default function StudentPage() {
  const { user, hydrated, problems, submissions } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<"today" | "past">("today");
  const [subjectFilter, setSubjectFilter] = useState("All");

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role === "teacher") router.replace("/teacher");
  }, [hydrated, user, router]);

  const now = new Date();

  const todayProblems = useMemo(() =>
    problems.filter(p => new Date(p.publishAt) <= now && new Date(p.closeAt) > now),
    [problems]
  );

  const pastProblems = useMemo(() =>
    problems.filter(p => new Date(p.closeAt) <= now),
    [problems]
  );

  const mySubmissions = useMemo(() =>
    submissions.filter(s => s.userId === user?.id),
    [submissions, user]
  );

  const subjects = ["All", ...Array.from(new Set(problems.map(p => p.subject)))];
  const baseProblems = (tab === "today" ? todayProblems : pastProblems)
    .filter(p => subjectFilter === "All" || p.subject === subjectFilter);

  // Group by teacher name
  const problemsByTeacher = useMemo(() => {
    const groups: Record<string, typeof baseProblems> = {};
    baseProblems.forEach(p => {
      const name = p.createdByName ?? "Unknown";
      if (!groups[name]) groups[name] = [];
      groups[name].push(p);
    });
    return groups;
  }, [baseProblems]);

  const teacherNames = Object.keys(problemsByTeacher).sort();

  const solved = mySubmissions.filter(s => s.isCorrect).length;
  const accuracy = mySubmissions.length ? Math.round(solved / mySubmissions.length * 100) : null;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-5 py-8 space-y-5">

        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm">
            {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"} 👋
          </p>
          <h2 className="text-xl font-bold mt-0.5">{user.name}</h2>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="font-bold">{todayProblems.length}</span>
              <span className="text-blue-100 ml-1">problems today</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="font-bold">⭐ {user.points}</span>
              <span className="text-blue-100 ml-1">pts</span>
            </div>
            {solved > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <span className="font-bold">✅ {solved}</span>
                <span className="text-blue-100 ml-1">solved</span>
              </div>
            )}
            {accuracy !== null && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <span className="font-bold">🎯 {accuracy}%</span>
                <span className="text-blue-100 ml-1">accuracy</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs + filter row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {(["today", "past"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {t === "today" ? `Today (${todayProblems.length})` : `Past (${pastProblems.length})`}
              </button>
            ))}
          </div>
          {subjects.length > 1 && (
            <div className="flex gap-1.5 flex-wrap">
              {subjects.map(s => (
                <button key={s} onClick={() => setSubjectFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${subjectFilter === s ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Problems grouped by teacher */}
        {baseProblems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <div className="text-4xl mb-3">{tab === "today" ? "🎉" : "📂"}</div>
            <p className="font-semibold text-slate-700">{tab === "today" ? "No problems posted yet" : "No past problems"}</p>
            <p className="text-sm text-slate-400 mt-1">
              {tab === "today" ? "Check back soon!" : "Problems older than 2 days are removed automatically."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {teacherNames.map(teacherName => (
              <div key={teacherName}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    {teacherName[0]}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{teacherName}</span>
                  <span className="text-xs text-slate-400">({problemsByTeacher[teacherName].length} problem{problemsByTeacher[teacherName].length !== 1 ? "s" : ""})</span>
                </div>
                <div className="space-y-4">
                  {problemsByTeacher[teacherName].map(p => (
                    <ProblemCard
                      key={p.id}
                      problem={p}
                      existingSubmission={mySubmissions.find(s => s.problemId === p.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
