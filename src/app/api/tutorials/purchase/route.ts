import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/tutorials/purchase?tutorialId=xxx  → check if current user purchased specific tutorial
// GET /api/tutorials/purchase                → list all of current user's purchased tutorials
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tutorialId = searchParams.get("tutorialId");

    if (tutorialId) {
      // Check if user purchased this specific tutorial
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_tutorialId: {
            userId: user.id,
            tutorialId,
          },
        },
      });
      return NextResponse.json({ purchased: !!purchase });
    }

    // List all purchases
    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      include: {
        tutorial: {
          include: {
            author: { select: { id: true, name: true } },
            _count: { select: { steps: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Error with purchase GET:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST /api/tutorials/purchase → purchase a tutorial
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tutorialId } = await request.json();
    if (!tutorialId) {
      return NextResponse.json({ error: "tutorialId is required" }, { status: 400 });
    }

    const tutorial = await prisma.tutorial.findUnique({
      where: { id: tutorialId },
    });

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
    }

    if (!tutorial.locked) {
      return NextResponse.json({ error: "This guide is not locked" }, { status: 400 });
    }

    if (tutorial.authorId === user.id) {
      return NextResponse.json({ error: "You cannot purchase your own guide" }, { status: 400 });
    }

    const existing = await prisma.purchase.findUnique({
      where: {
        userId_tutorialId: {
          userId: user.id,
          tutorialId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You already own this guide" }, { status: 409 });
    }

    // TODO: integrate real payment (Stripe) here before creating purchase
    // For now: instant unlock after "purchase" (free for dev)
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        tutorialId,
      },
    });

    return NextResponse.json({ success: true, purchaseId: purchase.id }, { status: 201 });
  } catch (error) {
    console.error("Error processing purchase:", error);
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 });
  }
}