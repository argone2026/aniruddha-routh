import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: "doodleCount" },
    });
    return Response.json({
      count: parseInt(config?.value ?? "0"),
    });
  } catch (error) {
    console.error("Error fetching doodle count:", error);
    return Response.json({ count: 0 });
  }
}

export async function POST() {
  try {
    const updated = await prisma.siteConfig.upsert({
      where: { key: "doodleCount" },
      update: { value: (parseInt((await prisma.siteConfig.findUnique({ where: { key: "doodleCount" } }))?.value ?? "0") + 1).toString() },
      create: { key: "doodleCount", value: "1" },
    });

    return Response.json({
      success: true,
      count: parseInt(updated.value),
    });
  } catch (error) {
    console.error("Error incrementing doodle count:", error);
    return Response.json(
      { error: "Failed to increment doodle count" },
      { status: 500 }
    );
  }
}
