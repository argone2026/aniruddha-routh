import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: "landingPageBio" },
    });
    return Response.json({
      bio: config?.value || "",
    });
  } catch (error) {
    console.error("Error fetching bio:", error);
    return Response.json(
      { error: "Failed to fetch bio" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bio } = await request.json();

    if (!bio || typeof bio !== "string") {
      return Response.json(
        { error: "Invalid bio provided" },
        { status: 400 }
      );
    }

    const updated = await prisma.siteConfig.upsert({
      where: { key: "landingPageBio" },
      update: { value: bio },
      create: { key: "landingPageBio", value: bio },
    });

    return Response.json({
      success: true,
      bio: updated.value,
    });
  } catch (error) {
    console.error("Error updating bio:", error);
    return Response.json(
      { error: "Failed to update bio" },
      { status: 500 }
    );
  }
}
