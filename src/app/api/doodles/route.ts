import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Check if we should use Vercel Blob for production
const useVercelBlob = process.env.NODE_ENV === "production" && process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_READ_WRITE_TOKEN.includes("vercel_blob_rw_...");

let put: any;
if (useVercelBlob) {
  try {
    const { put: blobPut } = require("@vercel/blob");
    put = blobPut;
  } catch (e) {
    console.warn("Vercel Blob not available, will use local storage");
  }
}

const DOODLES_DIR = join(process.cwd(), "public/doodles");

// Ensure doodles directory exists (dev only)
async function ensureDoodlesDir() {
  if (!existsSync(DOODLES_DIR)) {
    await mkdir(DOODLES_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    const doodles = await prisma.doodle.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        imageUrl: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return Response.json(doodles);
  } catch (error) {
    console.error("Error fetching doodles:", error);
    return Response.json(
      { error: "Failed to fetch doodles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { imageData, title } = await request.json();

    if (!imageData || typeof imageData !== "string") {
      return Response.json(
        { error: "Invalid image data" },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = imageData.includes(",") 
      ? imageData.split(",")[1] 
      : imageData;

    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `doodle-${Date.now()}.png`;
    let imageUrl = "";

    // Use Vercel Blob in production if available
    if (useVercelBlob && put) {
      try {
        const blob = await put(`doodles/${fileName}`, buffer, {
          access: "public",
          contentType: "image/png",
        });
        imageUrl = blob.url;
      } catch (blobError) {
        console.error("Vercel Blob error, falling back to database storage:", blobError);
        // Fall back to just storing metadata
        imageUrl = `blob:${fileName}`;
      }
    } else {
      // Use local file storage in development
      if (process.env.NODE_ENV !== "production") {
        try {
          await ensureDoodlesDir();
          const filePath = join(DOODLES_DIR, fileName);
          await writeFile(filePath, buffer);
          imageUrl = `/doodles/${fileName}`;
        } catch (fsError) {
          console.error("File system error:", fsError);
          imageUrl = `local:${fileName}`;
        }
      } else {
        // Production without Vercel Blob - store metadata only
        imageUrl = `stored:${fileName}`;
      }
    }

    // Save URL to database
    const doodle = await prisma.doodle.create({
      data: {
        imageUrl: imageUrl,
        title: title || `Doodle from ${new Date().toLocaleDateString()}`,
      },
    });

    // Increment doodle count
    const currentCount = await prisma.siteConfig.findUnique({
      where: { key: "doodleCount" },
    });
    const newCount = parseInt(currentCount?.value ?? "0") + 1;

    await prisma.siteConfig.upsert({
      where: { key: "doodleCount" },
      update: { value: newCount.toString() },
      create: { key: "doodleCount", value: "1" },
    });

    return Response.json({
      success: true,
      doodle,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error saving doodle:", errorMessage);
    return Response.json(
      { error: "Failed to save doodle", details: errorMessage },
      { status: 500 }
    );
  }
}
