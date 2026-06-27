import { NextRequest, NextResponse } from "next/server";
// @ts-ignore - Badge model not yet in generated client
import prisma from "@/lib/prisma";

// GET /api/badges - List all active badges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const badgeType = searchParams.get("badgeType");
    const tier = searchParams.get("tier");
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = {};
    if (badgeType) where.badgeType = badgeType;
    if (tier) where.tier = tier;
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === "true";

    // @ts-ignore - Badge model not yet in generated client
    const [total, badges] = await Promise.all([
      prisma.badge.count({ where }),
      prisma.badge.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({ total, badges });
  } catch (error) {
    console.error("Failed to list badges:", error);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}

// POST /api/badges - Create a new badge (admin only via /api/admin/badges)
// This endpoint is intentionally not exposed to prevent spam
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: "Use /api/admin/badges to create badges" }, { status: 403 });
}
