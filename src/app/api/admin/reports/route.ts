import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true } },
        tutorial: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Admin reports fetch error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
