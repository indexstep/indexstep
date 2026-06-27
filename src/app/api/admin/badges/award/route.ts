import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/admin/badges/award - Award a badge to a user
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { userId, badgeId, note } = body;

    if (!userId || !badgeId) {
      return NextResponse.json({ error: "userId and badgeId are required" }, { status: 400 });
    }

    // Verify badge exists and is active
    const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) return NextResponse.json({ error: "Badge not found" }, { status: 404 });
    if (!badge.isActive) return NextResponse.json({ error: "Badge is not active" }, { status: 400 });

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if already awarded
    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
    if (existing) return NextResponse.json({ error: "User already has this badge" }, { status: 409 });

    const userBadge = await prisma.userBadge.create({
      data: { userId, badgeId, note: note?.trim() || null },
      include: { badge: true },
    });

    return NextResponse.json(userBadge, { status: 201 });
  } catch (error) {
    console.error("Failed to award badge:", error);
    return NextResponse.json({ error: "Failed to award badge" }, { status: 500 });
  }
}

// POST /api/admin/badges/award/batch - Award a badge to multiple users
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { badgeId, userIds } = body;

    if (!badgeId || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "badgeId and userIds array are required" }, { status: 400 });
    }

    const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) return NextResponse.json({ error: "Badge not found" }, { status: 404 });
    if (!badge.isActive) return NextResponse.json({ error: "Badge is not active" }, { status: 400 });

    const awarded: string[] = [];
    const alreadyHad: string[] = [];

    for (const userId of userIds) {
      const existing = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId } },
      });
      if (existing) {
        alreadyHad.push(userId);
        continue;
      }
      await prisma.userBadge.create({ data: { userId, badgeId } });
      awarded.push(userId);
    }

    return NextResponse.json({ message: `Awarded to ${awarded.length} users`, awarded, alreadyHad });
  } catch (error) {
    console.error("Failed to batch award badge:", error);
    return NextResponse.json({ error: "Failed to award badges" }, { status: 500 });
  }
}
