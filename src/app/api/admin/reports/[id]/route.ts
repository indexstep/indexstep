import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { status, adminNote } = body;

    if (!status || !["REVIEWED", "DISMISSED", "ACTIONED"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 });
    }

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote || null,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin report update error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
