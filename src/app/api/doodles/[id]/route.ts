import { prisma } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.doodle.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting doodle:", error);
    return Response.json(
      { error: "Failed to delete doodle" },
      { status: 500 }
    );
  }
}
