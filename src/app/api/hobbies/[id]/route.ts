import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const contentType = req.headers.get("content-type") || "";

  let name = "";
  let description = "";
  let icon = "heart";
  let imageUrl: string | null | undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    name = String(formData.get("name") ?? "").trim();
    description = String(formData.get("description") ?? "").trim();
    icon = String(formData.get("icon") ?? "heart").trim() || "heart";

    const imageAction = String(formData.get("imageAction") ?? "keep");
    const existingImageUrl = String(formData.get("existingImageUrl") ?? "");
    imageUrl = existingImageUrl || null;

    if (imageAction === "remove") {
      imageUrl = null;
    }

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
    imageUrl = body.imageUrl !== undefined ? (body.imageUrl ? String(body.imageUrl) : null) : undefined;
  }

  const hobby = await prisma.hobby.update({
    where: { id },
    data: { name, description, icon, ...(imageUrl !== undefined ? { imageUrl } : {}) },
  });

  return NextResponse.json(hobby);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.hobby.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
