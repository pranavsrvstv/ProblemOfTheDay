import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  title:      z.string().min(1),
  body:       z.string().min(1),
  subject:    z.enum(["MATH","SCIENCE","ENGLISH","HISTORY","GEOGRAPHY","COMPUTER"]),
  difficulty: z.enum(["EASY","MEDIUM","HARD"]),
  hint1:      z.string().optional(),
  hint2:      z.string().optional(),
  hint3:      z.string().optional(),
  solution:   z.string().min(1),
  publishAt:  z.string(),
  closeAt:    z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "TEACHER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const problem = await db.problem.create({ data: { ...parsed.data, publishAt: new Date(parsed.data.publishAt), closeAt: new Date(parsed.data.closeAt) } });
  return NextResponse.json(problem, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const problems = await db.problem.findMany({
    where: { publishAt: { lte: now } },
    orderBy: { publishAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });
  return NextResponse.json(problems);
}
