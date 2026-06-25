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
      return NextResponse.json({ error: "Login to like guides" }, { status: 401 });
    }

    const { id } = await params;

    // Check tutorial exists
    const tutorial = await prisma.tutorial.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
    }

    // Can't like your own tutorial
    if (tutorial.authorId === user.id) {
      return NextResponse.json({ error: "Can't like your own guide" }, { status: 400 });
    }

    // Check if already liked
    const existingLike = await prisma.tutorialLike.findUnique({
      where: {
        userId_tutorialId: {
          userId: user.id,
          tutorialId: id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.tutorialLike.delete({
        where: { id: existingLike.id },
      });
      await prisma.tutorial.update({
        where: { id },
        data: { likeCount: { decrement: 1 } },
      });
      const updated = await prisma.tutorial.findUnique({
        where: { id },
        select: { likeCount: true },
      });
      return NextResponse.json({ liked: false, likeCount: updated?.likeCount ?? 0 });
    } else {
      // Like
      await prisma.tutorialLike.create({
        data: {
          userId: user.id,
          tutorialId: id,
        },
      });
      await prisma.tutorial.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      });
      const updated = await prisma.tutorial.findUnique({
        where: { id },
        select: { likeCount: true },
      });
      return NextResponse.json({ liked: true, likeCount: updated?.likeCount ?? 0 });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
