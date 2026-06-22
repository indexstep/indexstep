import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { filterContent } from "@/lib/profanity";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Admin and Moderator can edit any comment; regular users can only edit their own
    if (user.role !== "ADMIN" && user.role !== "MODERATOR" && user.id !== comment.authorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: "Comment must be under 2000 characters" }, { status: 400 });
    }

    const check = filterContent(content);
    if (!check.clean) {
      return NextResponse.json({ error: "Comment contains inappropriate content." }, { status: 400 });
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      include: {
        author: { select: { id: true, name: true, profilePicture: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error editing comment:", error);
    return NextResponse.json({ error: "Failed to edit comment" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && user.role !== "MODERATOR" && user.id !== comment.authorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
