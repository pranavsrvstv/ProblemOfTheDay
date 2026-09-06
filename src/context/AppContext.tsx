"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

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
  options: [string, string, string, string];
  answer: string;
  solution: string;
  publishAt: string;
  closeAt: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
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
  createProblem: (p: Omit<Problem, "id" | "createdAt" | "createdBy" | "createdByName">) => Promise<void>;
  deleteProblem: (id: string) => Promise<void>;
  submitAnswer: (problemId: string, answer: string, hintsUsed: number) => { isCorrect: boolean; pointsEarned: number; solution: string };
}

const AppContext = createContext<AppContextType>(null!);

const USERS: (User & { password: string })[] = [
  { id: "chahat-student",  name: "Chahat", username: "chahat", password: "chahatasstudent",  role: "student", points: 0, streak: 0 },
  { id: "chahat-teacher",  name: "Chahat", username: "chahat", password: "chahatasteacher",  role: "teacher", points: 0, streak: 0 },
  { id: "pranav-student",  name: "Pranav", username: "pranav", password: "pranavasastudent", role: "student", points: 0, streak: 0 },
  { id: "pranav-teacher",  name: "Pranav", username: "pranav", password: "pranavasateacher", role: "teacher", points: 0, streak: 0 },
];

const BIN_ID  = "6a9d5b96da38895dfe3fa702";
const API_KEY = "$2a$10$eFBijFWgpHyG5oXSaR.DTuF/tgP091OflF0VvtqlhrQzVSHSFyMai";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const HEADERS = { "Content-Type": "application/json", "X-Master-Key": API_KEY };

async function fetchBin(): Promise<{ problems: Problem[]; submissions: Submission[] }> {
  const res = await fetch(`${BIN_URL}/latest`, { headers: HEADERS });
  const json = await res.json();
  return json.record ?? { problems: [], submissions: [] };
}

async function updateBin(data: { problems: Problem[]; submissions: Submission[] }) {
  await fetch(BIN_URL, { method: "PUT", headers: HEADERS, body: JSON.stringify(data) });
}

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
  const binDataRef = useRef<{ problems: Problem[]; submissions: Submission[] }>({ problems: [], submissions: [] });

  useEffect(() => {
    const savedUser = localStorage.getItem("potd_user");
    if (savedUser) setUser(JSON.parse(savedUser));

    fetchBin().then(data => {
      const pruned = pruneOldProblems(data.problems ?? []);
      binDataRef.current = { problems: pruned, submissions: data.submissions ?? [] };
      setProblems(pruned);
      setSubmissions(data.submissions ?? []);
      // if problems were pruned, persist back
      if (pruned.length !== (data.problems ?? []).length) {
        updateBin({ problems: pruned, submissions: data.submissions ?? [] });
      }
    }).catch(() => {
      // fallback to localStorage if JSONBin unreachable
      const p = localStorage.getItem("potd_problems");
      const s = localStorage.getItem("potd_submissions");
      if (p) setProblems(pruneOldProblems(JSON.parse(p)));
      if (s) setSubmissions(JSON.parse(s));
    }).finally(() => setHydrated(true));
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

  const createProblem = useCallback(async (p: Omit<Problem, "id" | "createdAt" | "createdBy" | "createdByName">) => {
    const currentUser: User = JSON.parse(localStorage.getItem("potd_user")!);
    const newProblem: Problem = {
      ...p,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
    };
    const updated = { ...binDataRef.current, problems: [newProblem, ...binDataRef.current.problems] };
    binDataRef.current = updated;
    setProblems(updated.problems);
    await updateBin(updated);
  }, []);

  const deleteProblem = useCallback(async (id: string) => {
    const updated = { ...binDataRef.current, problems: binDataRef.current.problems.filter(p => p.id !== id) };
    binDataRef.current = updated;
    setProblems(updated.problems);
    await updateBin(updated);
  }, []);

  const submitAnswer = useCallback((problemId: string, answer: string, hintsUsed: number) => {
    const problem = binDataRef.current.problems.find(p => p.id === problemId)!;
    const currentUser: User = JSON.parse(localStorage.getItem("potd_user")!);
    const isCorrect = normalize(answer) === normalize(problem.answer);
    const pointsEarned = isCorrect ? pointsFor(problem.difficulty, hintsUsed) : 0;
    const sub: Submission = {
      id: `s-${Date.now()}`, userId: currentUser.id, problemId, answer,
      isCorrect, hintsUsed, pointsEarned,
      submittedAt: new Date().toISOString(),
    };
    const updated = { ...binDataRef.current, submissions: [...binDataRef.current.submissions, sub] };
    binDataRef.current = updated;
    setSubmissions(updated.submissions);
    updateBin(updated);
    if (isCorrect) {
      const updatedUser = { ...currentUser, points: currentUser.points + pointsEarned };
      setUser(updatedUser);
      localStorage.setItem("potd_user", JSON.stringify(updatedUser));
    }
    return { isCorrect, pointsEarned, solution: problem.solution };
  }, []);

  return (
    <AppContext.Provider value={{ user, hydrated, problems, submissions, login, logout, createProblem, deleteProblem, submitAnswer }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
