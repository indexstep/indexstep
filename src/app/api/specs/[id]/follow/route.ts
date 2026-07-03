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

    const existing = await prisma.specFollow.findUnique({
      where: { userId_specId: { userId: user.id, specId: id } },
    });

    if (existing) {
      await prisma.specFollow.delete({ where: { id: existing.id } });
      await prisma.spec.update({ where: { id }, data: { followCount: { decrement: 1 } } });
      const updated = await prisma.spec.findUnique({ where: { id } });
      return NextResponse.json({ following: false, followCount: updated?.followCount ?? 0 });
    } else {
      await prisma.specFollow.create({ data: { userId: user.id, specId: id } });
      await prisma.spec.update({ where: { id }, data: { followCount: { increment: 1 } } });
      const updated = await prisma.spec.findUnique({ where: { id } });
      return NextResponse.json({ following: true, followCount: updated?.followCount ?? 0 });
    }
  } catch (error) {
    console.error("Spec follow error:", error);
    return NextResponse.json({ error: "Failed to follow spec" }, { status: 500 });
  }
}
