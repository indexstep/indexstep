import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rootOnly = searchParams.get("rootOnly") === "true";
    const parentId = searchParams.get("parentId");

    const where: Record<string, unknown> = {};
    if (rootOnly) {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    const specs = await prisma.spec.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
        children: {
          select: {
            id: true, name: true, color: true, icon: true, imageUrl: true,
            _count: { select: { children: true } },
            children: true,
          },
        },
        _count: { select: { children: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ specs });
  } catch (error) {
    console.error("Failed to fetch specs:", error);
    return NextResponse.json({ error: "Failed to fetch specs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, details, color, icon, imageUrl, parentId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (parentId) {
      const parent = await prisma.spec.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Parent spec not found" }, { status: 404 });
      }
    }

    const spec = await prisma.spec.create({
      data: {
        name: name.trim(),
        details: details?.trim() || "",
        color: color || "#ff9940",
        icon: icon || null,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true } },
        children: {
          select: {
            id: true, name: true, color: true, icon: true, imageUrl: true,
            _count: { select: { children: true } },
            children: true,
          },
        },
        _count: { select: { children: true } },
      },
    });

    return NextResponse.json({ spec }, { status: 201 });
  } catch (error) {
    console.error("Failed to create spec:", error);
    return NextResponse.json({ error: "Failed to create spec" }, { status: 500 });
  }
}
