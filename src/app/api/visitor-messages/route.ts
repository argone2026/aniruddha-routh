import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.visitorMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body?.name ?? "").trim();
  const note = String(body?.note ?? "").trim();

  if (!name || !note) {
    return NextResponse.json(
      { error: "Name and note are required" },
      { status: 400 }
    );
  }

  if (name.length > 50 || note.length > 500) {
    return NextResponse.json(
      { error: "Name or note is too long" },
      { status: 400 }
    );
  }

  const message = await prisma.visitorMessage.create({
    data: { name, note },
  });

  return NextResponse.json(message, { status: 201 });
}
