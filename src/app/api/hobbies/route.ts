import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const hobbies = await prisma.hobby.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(hobbies);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, icon } = body;

  if (!name || !description) {
    return NextResponse.json(
      { error: "Name and description are required" },
      { status: 400 }
    );
  }

  const hobby = await prisma.hobby.create({
    data: { name, description, icon: icon ?? "heart" },
  });

  return NextResponse.json(hobby, { status: 201 });
}
