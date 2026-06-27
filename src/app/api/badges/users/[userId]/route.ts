import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ userId: string }> };

// GET /api/badges/users/[userId] - Get all badges for a user
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = await params;

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: "desc" },
    });

    const summary = {
      total: userBadges.length,
      byTier: { common: 0, rare: 0, epic: 0, legendary: 0 },
      byType: {} as Record<string, number>,
      latest: userBadges.slice(0, 5).map((ub) => ({
        id: ub.id,
        badgeId: ub.badgeId,
        awardedAt: ub.awardedAt.toISOString(),
        note: ub.note,
        badge: ub.badge,
      })),
    };

    for (const ub of userBadges) {
      const tier = (ub as UserBadge).badge.tier;
      if (tier in summary.byTier) summary.byTier[tier as keyof typeof summary.byTier]++;
      summary.byType[(ub as UserBadge).badge.badgeType] = (summary.byType[(ub as UserBadge).badge.badgeType] || 0) + 1;
    }

    return NextResponse.json({ userId, badges: userBadges, total: userBadges.length, summary });
  } catch (error) {
    console.error("Failed to get user badges:", error);
    return NextResponse.json({ error: "Failed to fetch user badges" }, { status: 500 });
  }
}
