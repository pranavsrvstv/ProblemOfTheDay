export type Subject = "MATH" | "SCIENCE" | "ENGLISH" | "HISTORY" | "GEOGRAPHY" | "COMPUTER";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type Role = "TEACHER" | "STUDENT";

export const SUBJECT_META: Record<Subject, { label: string; color: string; bg: string }> = {
  MATH:       { label: "Math",       color: "#3b82f6", bg: "#dbeafe" },
  SCIENCE:    { label: "Science",    color: "#22c55e", bg: "#dcfce7" },
  ENGLISH:    { label: "English",    color: "#f97316", bg: "#ffedd5" },
  HISTORY:    { label: "History",    color: "#a855f7", bg: "#f3e8ff" },
  GEOGRAPHY:  { label: "Geography",  color: "#14b8a6", bg: "#ccfbf1" },
  COMPUTER:   { label: "Computer",   color: "#ec4899", bg: "#fce7f3" },
};

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string }> = {
  EASY:   { label: "Easy",   color: "#22c55e" },
  MEDIUM: { label: "Medium", color: "#f59e0b" },
  HARD:   { label: "Hard",   color: "#ef4444" },
};

export interface Problem {
  id: string;
  title: string;
  body: string;
  subject: Subject;
  difficulty: Difficulty;
  hint1?: string | null;
  hint2?: string | null;
  hint3?: string | null;
  solution: string;
  publishAt: string;
  closeAt: string;
  createdAt: string;
  _count?: { submissions: number };
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
  user?: { name: string; email: string };
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  streak: number;
  batch?: string | null;
}
