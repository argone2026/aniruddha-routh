import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import path from "path";

export const runtime = "nodejs";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

export async function GET() {
  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Upload storage is not configured (missing BLOB_READ_WRITE_TOKEN)." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const caption = formData.get("caption") as string | null;
  const alt = formData.get("alt") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = Object.keys(MIME_TO_EXT);
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
      { status: 400 }
    );
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 }
    );
  }

  // Use the MIME-derived extension to prevent double-extension attacks
  const ext = MIME_TO_EXT[file.type];
  // Sanitize only the base name (strip extension from original name, then sanitize)
  const originalBase = path.basename(file.name, path.extname(file.name));
  const safeBaseName = originalBase.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  const uniqueName = `${Date.now()}-${safeBaseName}${ext}`;

  try {
    // Upload to Vercel Blob (works on Vercel serverless; no local disk write)
    const blob = await put(uniqueName, file, {
      access: "public",
      contentType: file.type,
    });

    const photo = await prisma.photo.create({
      data: {
        url: blob.url,
        caption: caption ?? null,
        alt: alt ?? null,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error";
    console.error("Photo upload failed", error);
    return NextResponse.json(
      {
        error: "Photo upload failed",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
