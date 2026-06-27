import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/badges - List all badges (including inactive)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const badgeType = searchParams.get("badgeType");
    const tier = searchParams.get("tier");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (badgeType) where.badgeType = badgeType;
    if (tier) where.tier = tier;
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === "true";
    if (search) where.name = { contains: search, mode: "insensitive" };

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
    console.error("Failed to list admin badges:", error);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}

// POST /api/admin/badges - Create a new badge
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { name, description, icon, color, badgeType, tier, criteria, imageUrl } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const badge = await prisma.badge.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        color: color || "#3b82f6",
        badgeType: badgeType || "custom",
        tier: tier || "common",
        criteria: criteria || {},
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    console.error("Failed to create badge:", error);
    return NextResponse.json({ error: "Failed to create badge" }, { status: 500 });
  }
}
