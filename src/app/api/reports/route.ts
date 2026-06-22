import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { filterContent } from "@/lib/profanity";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { type, reason, reportedUserId, tutorialId } = body;

    if (!type || !reason) {
      return NextResponse.json({ error: "Type and reason are required" }, { status: 400 });
    }

    const reasonCheck = filterContent(reason);
    if (!reasonCheck.clean) {
      return NextResponse.json({ error: "Report reason contains inappropriate content. Please revise." }, { status: 400 });
    }

    if (type === "USER" && !reportedUserId) {
      return NextResponse.json({ error: "Reported user ID is required" }, { status: 400 });
    }

    if (type === "TUTORIAL" && !tutorialId) {
      return NextResponse.json({ error: "Tutorial ID is required" }, { status: 400 });
    }

    // Can't report yourself
    if (type === "USER" && reportedUserId === user.id) {
      return NextResponse.json({ error: "You cannot report yourself" }, { status: 400 });
    }

    // Check if user/target exists
    if (type === "USER") {
      const target = await prisma.user.findUnique({ where: { id: reportedUserId } });
      if (!target) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    if (type === "TUTORIAL") {
      const tutorial = await prisma.tutorial.findUnique({ where: { id: tutorialId } });
      if (!tutorial) {
        return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
      }
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        type,
        reason: reason.trim(),
        reporterId: user.id,
        ...(reportedUserId && { reportedUserId }),
        ...(tutorialId && { tutorialId }),
      },
    });

    // Log the report with IP address
    await prisma.systemLog.create({
      data: {
        action: "CREATE_REPORT",
        target: report.id,
        actorId: user.id,
        ipAddress: getClientIp(request),
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Report submission error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
