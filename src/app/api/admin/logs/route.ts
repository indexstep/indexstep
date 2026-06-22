import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.systemLog.count(),
    ]);

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error("Admin logs error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
