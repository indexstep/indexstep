import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/admin/badges/[id] - Get single badge
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;

    const badge = await prisma.badge.findUnique({ where: { id } });
    if (!badge) return NextResponse.json({ error: "Badge not found" }, { status: 404 });

    return NextResponse.json(badge);
  } catch (error) {
    console.error("Failed to get badge:", error);
    return NextResponse.json({ error: "Failed to get badge" }, { status: 500 });
  }
}

// PATCH /api/admin/badges/[id] - Update badge
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, color, badgeType, tier, criteria, isActive } = body;

    const badge = await prisma.badge.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(icon !== undefined && { icon: icon?.trim() || null }),
        ...(color !== undefined && { color }),
        ...(badgeType !== undefined && { badgeType }),
        ...(tier !== undefined && { tier }),
        ...(criteria !== undefined && { criteria }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(badge);
  } catch (error) {
    console.error("Failed to update badge:", error);
    return NextResponse.json({ error: "Failed to update badge" }, { status: 500 });
  }
}

// DELETE /api/admin/badges/[id] - Soft delete (deactivate) badge
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.badge.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Badge deactivated" });
  } catch (error) {
    console.error("Failed to delete badge:", error);
    return NextResponse.json({ error: "Failed to delete badge" }, { status: 500 });
  }
}
