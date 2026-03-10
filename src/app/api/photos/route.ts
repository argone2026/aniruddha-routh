import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Use the MIME-derived extension to prevent double-extension attacks
  const ext = MIME_TO_EXT[file.type];
  // Sanitize only the base name (strip extension from original name, then sanitize)
  const originalBase = path.basename(file.name, path.extname(file.name));
  const safeBaseName = originalBase.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  const uniqueName = `${Date.now()}-${safeBaseName}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  // Ensure upload directory exists
  await mkdir(uploadDir, { recursive: true });

  // Resolve file path and verify it stays within uploadDir (prevent path traversal)
  const filePath = path.resolve(uploadDir, uniqueName);
  if (!filePath.startsWith(uploadDir + path.sep) && filePath !== uploadDir) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  await writeFile(filePath, buffer);

  const photo = await prisma.photo.create({
    data: {
      url: `/uploads/${uniqueName}`,
      caption: caption ?? null,
      alt: alt ?? null,
    },
  });

  return NextResponse.json(photo, { status: 201 });
}
