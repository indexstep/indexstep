import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/tutorials/[id]/versions — list all versions of a tutorial
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const tutorial = await prisma.tutorial.findUnique({ where: { id } });
    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
    }

    // Only author, mods, or admins can see version history
    if (user.role !== "ADMIN" && user.role !== "MODERATOR" && user.id !== tutorial.authorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const versions = await prisma.tutorialVersion.findMany({
      where: { tutorialId: id },
      orderBy: { editedAt: "desc" },
      select: {
        id: true,
        title: true,
        editedAt: true,
        editReason: true,
        isFlagged: true,
      },
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}
