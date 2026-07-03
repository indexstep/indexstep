import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const spec = await prisma.spec.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        children: {
          where: { parentId: id },
          select: {
            id: true, name: true, details: true, color: true, icon: true, imageUrl: true,
            viewCount: true, likeCount: true, followCount: true,
            _count: { select: { children: true } },
            children: true,
          },
          orderBy: { createdAt: "asc" },
        },
        parent: { select: { id: true, name: true } },
      },
    });

    if (!spec) return NextResponse.json({ error: "Spec not found" }, { status: 404 });

    let likedByMe = false;
    let followedByMe = false;

    if (user) {
      const like = await prisma.specLike.findUnique({
        where: { userId_specId: { userId: user.id, specId: id } },
      });
      likedByMe = !!like;

      const follow = await prisma.specFollow.findUnique({
        where: { userId_specId: { userId: user.id, specId: id } },
      });
      followedByMe = !!follow;
    }

    return NextResponse.json({ spec, likedByMe, followedByMe });
  } catch (error) {
    console.error("Failed to fetch spec:", error);
    return NextResponse.json({ error: "Failed to fetch spec" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, details, color, icon, imageUrl, parentId } = body;

    const existing = await prisma.spec.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    if (existing.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (parentId !== undefined && parentId !== null) {
      let curr = await prisma.spec.findUnique({ where: { id: parentId } });
      while (curr) {
        if (curr.id === id) return NextResponse.json({ error: "Cannot set a descendant as parent" }, { status: 400 });
        curr = curr.parentId ? await prisma.spec.findUnique({ where: { id: curr.parentId } }) : null;
      }
    }

    const spec = await prisma.spec.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        details: details !== undefined ? details.trim() : existing.details,
        color: color || existing.color,
        icon: icon !== undefined ? icon : existing.icon,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        parentId: parentId !== undefined ? (parentId || null) : existing.parentId,
      },
      include: {
        author: { select: { id: true, name: true } },
        children: {
          select: {
            id: true, name: true, details: true, color: true, icon: true, imageUrl: true,
            viewCount: true, likeCount: true, followCount: true,
            _count: { select: { children: true } },
            children: true,
          },
        },
        _count: { select: { children: true } },
      },
    });
    return NextResponse.json({ spec });
  } catch (error) {
    console.error("Failed to update spec:", error);
    return NextResponse.json({ error: "Failed to update spec" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const existing = await prisma.spec.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    if (existing.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.spec.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete spec:", error);
    return NextResponse.json({ error: "Failed to delete spec" }, { status: 500 });
  }
}
