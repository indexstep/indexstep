import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ userId: string; badgeId: string }> };

// DELETE /api/admin/badges/users/[userId]/badges/[badgeId] - Revoke a badge from a user
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { userId, badgeId } = await params;

    const userBadge = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });

    if (!userBadge) {
      return NextResponse.json({ error: "User does not have this badge" }, { status: 404 });
    }

    await prisma.userBadge.delete({
      where: { userId_badgeId: { userId, badgeId } },
    });

    return NextResponse.json({ message: "Badge revoked" });
  } catch (error) {
    console.error("Failed to revoke badge:", error);
    return NextResponse.json({ error: "Failed to revoke badge" }, { status: 500 });
  }
}
