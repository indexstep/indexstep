import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { filterContent } from "@/lib/profanity";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const spec = await prisma.spec.findUnique({ where: { id } });
    if (!spec) {
      return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { specId: id, parentId: null },
      include: {
        author: { select: { id: true, name: true, profilePicture: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, profilePicture: true } },
            replies: {
              include: {
                author: { select: { id: true, name: true, profilePicture: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.banned) {
      return NextResponse.json({ error: "You are banned from commenting" }, { status: 403 });
    }

    const { id } = await params;
    const spec = await prisma.spec.findUnique({ where: { id } });
    if (!spec) {
      return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    }

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: "Comment must be under 2000 characters" }, { status: 400 });
    }

    const check = filterContent(content);
    if (!check.clean) {
      return NextResponse.json({ error: "Your comment contains inappropriate content. Please revise and try again." }, { status: 400 });
    }

    // If replying, verify parent comment exists and belongs to same spec
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent || parent.specId !== id) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        specId: id,
        parentId: parentId || null,
      },
      include: {
        author: { select: { id: true, name: true, profilePicture: true } },
      },
    });

    // Log the comment
    await prisma.systemLog.create({
      data: {
        action: "CREATE_SPEC_COMMENT",
        target: id,
        actorId: user.id,
        ipAddress: getClientIp(request),
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
