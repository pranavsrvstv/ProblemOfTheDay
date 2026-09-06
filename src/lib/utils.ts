import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pointsForSubmission(isCorrect: boolean, hintsUsed: number, difficulty: string): number {
  if (!isCorrect) return 0;
  const base = difficulty === "HARD" ? 30 : difficulty === "MEDIUM" ? 20 : 10;
  return Math.max(base - hintsUsed * 3, 1);
}

export function isOpen(closeAt: string): boolean {
  return new Date(closeAt) > new Date();
}

export function isPublished(publishAt: string): boolean {
  return new Date(publishAt) <= new Date();
}
