import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { points: "desc" },
    take: 50,
    select: { id: true, name: true, points: true, streak: true, batch: true },
  });
  return NextResponse.json(users);
}
