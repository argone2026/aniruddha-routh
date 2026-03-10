import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const achievements = await prisma.achievement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(achievements);
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

  const achievement = await prisma.achievement.create({
    data: { title, description, date, icon: icon ?? "trophy" },
  });

  return NextResponse.json(achievement, { status: 201 });
}
