import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Recursively fetch a spec with all its descendants to unlimited depth
async function fetchSpecTree(where: Record<string, unknown>) {
  const specs = await prisma.spec.findMany({
    where,
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { children: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch children recursively for each spec
  const attachChildren = async (specs: any[]): Promise<any[]> => {
    return Promise.all(
      specs.map(async (spec) => {
        const children = await prisma.spec.findMany({
          where: { parentId: spec.id },
          include: {
            author: { select: { id: true, name: true } },
            _count: { select: { children: true } },
          },
          orderBy: { createdAt: "asc" },
        });
        if (children.length > 0) {
          spec.children = await attachChildren(children);
        } else {
          spec.children = [];
        }
        return spec;
      })
    );
  };

  return attachChildren(specs);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rootOnly = searchParams.get("rootOnly") === "true";
    const parentId = searchParams.get("parentId");
    const search = searchParams.get("search") || "";
    const flat = searchParams.get("flat") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "newest";

    const where: Record<string, unknown> = {};
    if (rootOnly) {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    } else {
      // Default: only root specs (parentId = null) for tree view
      where.parentId = null;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { details: { contains: search } },
      ];
    }

    const orderBy: Record<string, string> =
      sort === "oldest" ? { createdAt: "asc" }
    : sort === "popular" ? { viewCount: "desc" }
    : { createdAt: "desc" };

    const user = await getCurrentUser();
    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

    // Filter: only show published or linkOnly specs to public, unpublished only to author/admin
    if (!user) {
      where.published = true;
    } else if (!isAdmin) {
      where.OR = [
        { published: true },
        { linkOnly: true, authorId: user.id },
        { authorId: user.id },
      ];
    }

    if (flat) {
      // Flat list mode for search page
      const [specs, total] = await Promise.all([
        prisma.spec.findMany({
          where,
          include: {
            author: { select: { id: true, name: true } },
            _count: { select: { children: true } },
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.spec.count({ where }),
      ]);
      return NextResponse.json({
        specs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }

    const specs = await fetchSpecTree(where);

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
    const { name, details, color, icon, imageUrl, parentId, published, locked, lockContent, price, password, linkOnly } = body;

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
        published: published ?? false,
        locked: locked ?? false,
        lockContent: lockContent ?? false,
        price: price ?? 0,
        password: password || null,
        linkOnly: linkOnly ?? false,
      } as any,
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
