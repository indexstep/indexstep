import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const spec = await prisma.spec.findUnique({ where: { id } });
    if (!spec) {
      return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    }

    // Can't like own spec
    if (spec.authorId === user.id) {
      return NextResponse.json({ error: "Cannot like your own spec" }, { status: 400 });
    }

    const existing = await prisma.specLike.findUnique({
      where: { userId_specId: { userId: user.id, specId: id } },
    });

    if (existing) {
      await prisma.specLike.delete({ where: { id: existing.id } });
      await prisma.spec.update({ where: { id }, data: { likeCount: { decrement: 1 } } });
      const updated = await prisma.spec.findUnique({ where: { id } });
      return NextResponse.json({ liked: false, likeCount: updated?.likeCount ?? 0 });
    } else {
      await prisma.specLike.create({ data: { userId: user.id, specId: id } });
      await prisma.spec.update({ where: { id }, data: { likeCount: { increment: 1 } } });
      const updated = await prisma.spec.findUnique({ where: { id } });
      return NextResponse.json({ liked: true, likeCount: updated?.likeCount ?? 0 });
    }
  } catch (error) {
    console.error("Spec like error:", error);
    return NextResponse.json({ error: "Failed to like spec" }, { status: 500 });
  }
}
