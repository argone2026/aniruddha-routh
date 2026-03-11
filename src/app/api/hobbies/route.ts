import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

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

  const contentType = req.headers.get("content-type") || "";

  let name = "";
  let description = "";
  let icon = "heart";
  let imageUrl: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    name = String(formData.get("name") ?? "").trim();
    description = String(formData.get("description") ?? "").trim();
    icon = String(formData.get("icon") ?? "heart").trim() || "heart";

    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      const blob = await put(`hobbies/${Date.now()}-${file.name}`, file, {
        access: "public",
      });
      imageUrl = blob.url;
    }
  } else {
    const body = await req.json();
    name = String(body.name ?? "").trim();
    description = String(body.description ?? "").trim();
    icon = String(body.icon ?? "heart").trim() || "heart";
    imageUrl = body.imageUrl ? String(body.imageUrl) : null;
  }

  if (!name || !description) {
    return NextResponse.json(
      { error: "Name and description are required" },
      { status: 400 }
    );
  }

  const hobby = await prisma.hobby.create({
    data: { name, description, icon, imageUrl },
  });

  return NextResponse.json(hobby, { status: 201 });
}
