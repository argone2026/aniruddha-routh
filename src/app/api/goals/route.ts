import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const goals = await prisma.goal.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, date, icon } = body;

  if (!title || !description || !date) {
    return NextResponse.json(
      { error: "Title, description, and date are required" },
      { status: 400 }
    );
  }

  const goal = await prisma.goal.create({
    data: { title, description, date, icon: icon ?? "star" },
  });

  return NextResponse.json(goal, { status: 201 });
}
