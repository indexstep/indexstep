import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const [totalUsers, totalTutorials, recentLogs] = await Promise.all([
      prisma.user.count(),
      prisma.tutorial.count(),
      prisma.systemLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    // Count images properly
    const tutorialsWithCover = await prisma.tutorial.count({
      where: { coverImage: { not: null } },
    });
    const stepsWithImages = await prisma.step.count({
      where: { imageUrl: { not: null } },
    });
    const totalImages = tutorialsWithCover + stepsWithImages;

    return NextResponse.json({
      totalUsers,
      totalTutorials,
      totalImages,
      recentLogs,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
