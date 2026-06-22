import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
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

    const likedByUsers = comment.likedBy ? comment.likedBy.split(",").filter(Boolean) : [];
    const alreadyLiked = likedByUsers.includes(user.id);

    let newLikedBy: string;
    let newLikeCount: number;

    if (alreadyLiked) {
      newLikedBy = likedByUsers.filter((uid) => uid !== user.id).join(",");
      newLikeCount = Math.max(0, comment.likeCount - 1);
    } else {
      newLikedBy = likedByUsers.length > 0 ? `${comment.likedBy},${user.id}` : user.id;
      newLikeCount = comment.likeCount + 1;
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { likedBy: newLikedBy, likeCount: newLikeCount },
    });

    return NextResponse.json({ likeCount: updated.likeCount, likedBy: updated.likedBy, likedByMe: !alreadyLiked });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}