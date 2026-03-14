import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const DOODLES_DIR = join(process.cwd(), "public/doodles");

// Ensure doodles directory exists
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

    // Ensure doodles directory exists
    await ensureDoodlesDir();

    // Convert base64 to buffer
    const base64Data = imageData.includes(",") 
      ? imageData.split(",")[1] 
      : imageData;

    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `doodle-${Date.now()}.png`;
    const filePath = join(DOODLES_DIR, fileName);
    const imageUrl = `/doodles/${fileName}`;

    // Save to local public folder
    await writeFile(filePath, buffer);

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
    console.error("Full error:", error);
    return Response.json(
      { error: "Failed to save doodle", details: errorMessage },
      { status: 500 }
    );
  }
}
