import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const searchParams = new URL(request.url).searchParams;
    const inputPassword = searchParams.get("password");

    // @ts-ignore - Prisma types stale, fields exist in DB
    const spec: any = await prisma.spec.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        children: {
          where: { parentId: id },
          orderBy: { createdAt: "asc" },
        },
        parent: { select: { id: true, name: true } },
        attachments: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!spec) return NextResponse.json({ error: "Spec not found" }, { status: 404 });

    const isAuthor = user?.id === spec.authorId;
    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";
    const isPublic = spec.published || spec.linkOnly;

    // Check access
    if (!isPublic && !isAuthor && !isAdmin) {
      return NextResponse.json({ error: "This spec is private", locked: true }, { status: 403 });
    }

    // Check password
    if (spec.locked && spec.password && !isAuthor && !isAdmin) {
      if (inputPassword !== spec.password) {
        return NextResponse.json({ error: "Password required", locked: true, passwordRequired: true }, { status: 401 });
      }
    }

    // Increment view count
    await prisma.spec.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    let likedByMe = false;
    let followedByMe = false;

    if (user) {
      const [like, follow] = await Promise.all([
        prisma.specLike.findUnique({ where: { userId_specId: { userId: user.id, specId: id } } }),
        prisma.specFollow.findUnique({ where: { userId_specId: { userId: user.id, specId: id } } }),
      ]);
      likedByMe = !!like;
      followedByMe = !!follow;
    }

    // If locked, hide children details to non-author
    const children = (isAuthor || isAdmin) ? spec.children : spec.children.map((c: any) => ({
      ...c,
      details: c.locked ? "[LOCKED]" : c.details,
    }));

    return NextResponse.json({
      spec: { ...spec, children },
      likedByMe,
      followedByMe,
    });
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
    const { name, details, color, icon, imageUrl, parentId, published, locked, lockContent, price, password, linkOnly } = body;

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

    // @ts-ignore - Prisma types stale
    const existingAny: any = existing;
    // @ts-ignore - Prisma types stale
    const spec: any = await prisma.spec.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existingAny.name,
        details: details !== undefined ? details.trim() : existingAny.details,
        color: color || existingAny.color,
        icon: icon !== undefined ? icon : existingAny.icon,
        imageUrl: imageUrl !== undefined ? imageUrl : existingAny.imageUrl,
        parentId: parentId !== undefined ? (parentId || null) : existingAny.parentId,
        published: published !== undefined ? published : existingAny.published,
        locked: locked !== undefined ? locked : existingAny.locked,
        lockContent: lockContent !== undefined ? lockContent : existingAny.lockContent,
        price: price !== undefined ? price : existingAny.price,
        password: password !== undefined ? (password || null) : existingAny.password,
        linkOnly: linkOnly !== undefined ? linkOnly : existingAny.linkOnly,
        editCount: { increment: 1 },
        lastEditAt: new Date(),
      } as any,
      include: {
        author: { select: { id: true, name: true } },
        children: {
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { children: true } },
        attachments: { orderBy: { createdAt: "asc" } },
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
