import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const doodles = await prisma.doodle.findMany({
      orderBy: { createdAt: "desc" },
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

    // Convert base64 to buffer for blob upload
    const base64Data = imageData.includes(",") 
      ? imageData.split(",")[1] 
      : imageData;

    // Create a simple base64 data URL for storage
    // For now, store the data URL directly since it's smaller
    const doodle = await prisma.doodle.create({
      data: {
        imageUrl: imageData, // Store the full data URL
        title: title || `Doodle from ${new Date().toLocaleDateString()}`,
      },
    });

    // Increment doodle count
    await prisma.siteConfig.upsert({
      where: { key: "doodleCount" },
      update: { value: (parseInt((await prisma.siteConfig.findUnique({ where: { key: "doodleCount" } }))?.value ?? "0") + 1).toString() },
      create: { key: "doodleCount", value: "1" },
    });

    return Response.json({
      success: true,
      doodle,
    });
  } catch (error) {
    console.error("Error saving doodle:", error);
    return Response.json(
      { error: "Failed to save doodle" },
      { status: 500 }
    );
  }
}
