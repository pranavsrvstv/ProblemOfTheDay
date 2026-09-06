"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Subject = "Math" | "Science" | "English" | "History" | "Computer";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type Role = "teacher" | "student";

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  points: number;
  streak: number;
}

export interface Problem {
  id: string;
  title: string;
  body: string;
  subject: Subject;
  difficulty: Difficulty;
  hints: string[];
  options: [string, string, string, string]; // A, B, C, D — empty string = no option
  answer: string;
  solution: string;
  publishAt: string;
  closeAt: string;
  createdAt: string;
  createdBy: string;   // user id of the teacher who created it
  createdByName: string; // display name
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  answer: string;
  isCorrect: boolean;
  hintsUsed: number;
  pointsEarned: number;
  submittedAt: string;
}

interface AppContextType {
  user: User | null;
  hydrated: boolean;
  problems: Problem[];
  submissions: Submission[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createProblem: (p: Omit<Problem, "id" | "createdAt" | "createdBy" | "createdByName">) => void;
  deleteProblem: (id: string) => void;
  submitAnswer: (problemId: string, answer: string, hintsUsed: number) => { isCorrect: boolean; pointsEarned: number; solution: string };
}

const AppContext = createContext<AppContextType>(null!);

// ── 4 hardcoded users, dual-role by password ───────────────────────────────
const USERS: (User & { password: string })[] = [
  { id: "chahat-student", name: "Chahat", username: "chahat", password: "chahatasstudent", role: "student", points: 0, streak: 0 },
  { id: "chahat-teacher", name: "Chahat", username: "chahat", password: "chahatasteacher", role: "teacher", points: 0, streak: 0 },
  { id: "pranav-student", name: "Pranav", username: "pranav", password: "pranavasastudent", role: "student", points: 0, streak: 0 },
  { id: "pranav-teacher", name: "Pranav", username: "pranav", password: "pranavasateacher", role: "teacher", points: 0, streak: 0 },
];

function normalize(s: string) {
  return s.toLowerCase().replace(/\s*,\s*/g, ",").trim();
}

function pointsFor(difficulty: Difficulty, hintsUsed: number) {
  const base = difficulty === "Hard" ? 30 : difficulty === "Medium" ? 20 : 10;
  return Math.max(base - hintsUsed * 3, 1);
}

function pruneOldProblems(problems: Problem[]): Problem[] {
  const cutoff = Date.now() - 2 * 24 * 60 * 60 * 1000;
  return problems.filter(p => new Date(p.createdAt).getTime() > cutoff);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("potd_user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedProblems = localStorage.getItem("potd_problems");
    const raw: Problem[] = savedProblems ? JSON.parse(savedProblems) : [];
    const pruned = pruneOldProblems(raw);
    setProblems(pruned);
    localStorage.setItem("potd_problems", JSON.stringify(pruned));

    const savedSubs = localStorage.getItem("potd_submissions");
    if (savedSubs) setSubmissions(JSON.parse(savedSubs));
    setHydrated(true);
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const found = USERS.find(u => u.username === username.trim() && u.password === password);
    if (!found) return false;
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem("potd_user", JSON.stringify(userData));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("potd_user");
  }, []);

  const createProblem = useCallback((p: Omit<Problem, "id" | "createdAt" | "createdBy" | "createdByName">) => {
    const currentUser: User = JSON.parse(localStorage.getItem("potd_user")!);
    const newProblem: Problem = {
      ...p,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
    };
    setProblems(prev => {
      const updated = [newProblem, ...prev];
      localStorage.setItem("potd_problems", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteProblem = useCallback((id: string) => {
    setProblems(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem("potd_problems", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const submitAnswer = useCallback((problemId: string, answer: string, hintsUsed: number) => {
    const problem = problems.find(p => p.id === problemId)!;
    const isCorrect = normalize(answer) === normalize(problem.answer);
    const pointsEarned = isCorrect ? pointsFor(problem.difficulty, hintsUsed) : 0;
    const sub: Submission = {
      id: `s-${Date.now()}`, userId: user!.id, problemId, answer,
      isCorrect, hintsUsed, pointsEarned,
      submittedAt: new Date().toISOString(),
    };
    setSubmissions(prev => {
      const updated = [...prev, sub];
      localStorage.setItem("potd_submissions", JSON.stringify(updated));
      return updated;
    });
    if (isCorrect && user) {
      const updatedUser = { ...user, points: user.points + pointsEarned };
      setUser(updatedUser);
      localStorage.setItem("potd_user", JSON.stringify(updatedUser));
    }
    return { isCorrect, pointsEarned, solution: problem.solution };
  }, [problems, user]);

  return (
    <AppContext.Provider value={{ user, hydrated, problems, submissions, login, logout, createProblem, deleteProblem, submitAnswer }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
