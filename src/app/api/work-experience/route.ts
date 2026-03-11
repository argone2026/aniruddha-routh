import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sortWorkExperienceByMostRecent } from "@/lib/workExperienceSort";

export async function GET() {
  const workExperienceRaw = await prisma.workExperience.findMany({
    orderBy: { createdAt: "desc" },
  });
  const workExperience = sortWorkExperienceByMostRecent(workExperienceRaw);
  return NextResponse.json(workExperience);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { role, company, period, location, description } = body;

  if (!role || !company || !period || !description) {
    return NextResponse.json(
      { error: "Role, company, period, and description are required" },
      { status: 400 }
    );
  }

  const item = await prisma.workExperience.create({
    data: {
      role,
      company,
      period,
      location: location || null,
      description,
    },
  });

  return NextResponse.json(item, { status: 201 });
}