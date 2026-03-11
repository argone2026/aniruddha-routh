import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const CONFIG_KEY = "profilePictureUrl";

export async function GET() {
  const config = await prisma.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
  return NextResponse.json({ url: config?.value ?? null });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Upload storage not configured (missing BLOB_READ_WRITE_TOKEN)." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!Object.keys(MIME_TO_EXT).includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
      { status: 400 }
    );
  }

  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File too large. Maximum 5 MB." }, { status: 400 });
  }

  const ext = MIME_TO_EXT[file.type];
  const blob = await put(`profile/avatar${ext}`, file, {
    access: "public",
    allowOverwrite: true,
  });

  await prisma.siteConfig.upsert({
    where: { key: CONFIG_KEY },
    update: { value: blob.url },
    create: { key: CONFIG_KEY, value: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.siteConfig.deleteMany({ where: { key: CONFIG_KEY } });
  return NextResponse.json({ ok: true });
}
