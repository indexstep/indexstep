import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const tutorial = await prisma.tutorial.findUnique({ where: { id } });

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
    }

    await prisma.tutorial.delete({ where: { id } });

    await prisma.systemLog.create({
      data: {
        action: "DELETE_TUTORIAL_ADMIN",
        target: id,
        actorId: admin.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin tutorial delete error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete tutorial" },
      { status: 500 }
    );
  }
}
