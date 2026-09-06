import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pointsForSubmission } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  problemId: z.string(),
  answer:    z.string().min(1),
  hintsUsed: z.number().int().min(0).max(3).default(0),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { problemId, answer, hintsUsed } = parsed.data;

  const problem = await db.problem.findUnique({ where: { id: problemId } });
  if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  if (new Date(problem.closeAt) < new Date()) return NextResponse.json({ error: "Submission closed" }, { status: 400 });

  const existing = await db.submission.findUnique({ where: { userId_problemId: { userId, problemId } } });
  if (existing) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

  // Simple exact-match check — upgrade to AI evaluation later
  const isCorrect = answer.trim().toLowerCase() === problem.solution.trim().toLowerCase();
  const pointsEarned = pointsForSubmission(isCorrect, hintsUsed, problem.difficulty);

  const [submission] = await db.$transaction([
    db.submission.create({ data: { userId, problemId, answer, isCorrect, hintsUsed, pointsEarned } }),
    db.user.update({ where: { id: userId }, data: { points: { increment: pointsEarned } } }),
  ]);

  return NextResponse.json({ submission, isCorrect, pointsEarned, solution: problem.solution }, { status: 201 });
}
