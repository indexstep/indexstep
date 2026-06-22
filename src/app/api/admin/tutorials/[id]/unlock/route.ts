import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const tutorial = await prisma.tutorial.findUnique({ where: { id } });
    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
    }

    await prisma.tutorial.update({
      where: { id },
      data: { password: null },
    });

    return NextResponse.json({ success: true, message: "Password removed. Guide is now public." });
  } catch (error) {
    console.error("Admin unlock tutorial error:", error);
    return NextResponse.json({ error: "Failed to unlock tutorial" }, { status: 500 });
  }
}
