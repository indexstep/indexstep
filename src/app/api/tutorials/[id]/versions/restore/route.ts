import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

// POST /api/tutorials/[id]/versions/restore — restore a tutorial to a previous version
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
    const { versionId } = await request.json();

    if (!versionId) {
      return NextResponse.json({ error: "versionId is required" }, { status: 400 });
    }

    const tutorial = await prisma.tutorial.findUnique({
      where: { id },
      include: { steps: true, tools: true },
    });
    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && user.role !== "MODERATOR" && user.id !== tutorial.authorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const version = await prisma.tutorialVersion.findUnique({ where: { id: versionId } });
    if (!version || version.tutorialId !== id) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const now = new Date();

    // Save current state as a version before restoring (so we can undo)
    await prisma.tutorialVersion.create({
      data: {
        tutorialId: id,
        title: tutorial.title,
        description: tutorial.description,
        category: tutorial.category,
        difficulty: tutorial.difficulty,
        timeMinutes: tutorial.timeMinutes,
        coverImage: tutorial.coverImage,
        published: tutorial.published,
        locked: tutorial.locked,
        lockContent: tutorial.lockContent,
        price: tutorial.price,
        linkOnly: (tutorial as any).linkOnly ?? false,
        customToolConfigs: tutorial.customToolConfigs as object || null,
        steps: tutorial.steps.map(s => ({ id: s.id, title: s.title, content: s.content, imageUrl: s.imageUrl, order: s.order })),
        tools: tutorial.tools.map(t => ({ id: t.id, name: t.name, quantity: t.quantity, size: t.size, kind: t.kind, notes: t.notes, category: t.category })),
        editReason: "Auto-saved before restore",
        isFlagged: false,
      },
    });

    // Delete current tools and steps
    await prisma.tool.deleteMany({ where: { tutorialId: id } });
    await prisma.step.deleteMany({ where: { tutorialId: id } });

    // Restore from version
    const parsedSteps: { id: string; title: string; content: string; imageUrl: string | null; order: number }[] = typeof version.steps === 'string' ? JSON.parse(version.steps as string) : version.steps as any[];
    const parsedTools: { id: string; name: string; quantity: string | null; size: string | null; kind: string | null; notes: string | null; category: string }[] = typeof version.tools === 'string' ? JSON.parse(version.tools as string) : version.tools as any[];

    const restored = await prisma.tutorial.update({
      where: { id },
      data: {
        title: version.title,
        description: version.description,
        category: version.category,
        difficulty: version.difficulty,
        timeMinutes: version.timeMinutes,
        coverImage: version.coverImage,
        published: version.published,
        locked: version.locked,
        lockContent: version.lockContent,
        price: version.price,
        customToolConfigs: version.customToolConfigs as object || null,
        tools: {
          create: parsedTools.map(t => ({
            name: t.name,
            quantity: t.quantity || null,
            size: t.size || null,
            kind: t.kind || null,
            notes: t.notes || null,
            category: t.category || "DIY",
          })),
        },
        steps: {
          create: parsedSteps.map((s, idx) => ({
            order: idx + 1,
            title: s.title,
            content: s.content,
            imageUrl: s.imageUrl || null,
          })),
        },
        editCount: { increment: 1 },
        lastEditAt: now,
        isFlagged: false,
        flagReason: null,
      },
      include: {
        author: { select: { id: true, name: true } },
        tools: true,
        steps: { orderBy: { order: "asc" } },
      },
    });

    await prisma.systemLog.create({
      data: {
        action: "RESTORE_TUTORIAL_VERSION",
        target: id,
        actorId: user.id,
        ipAddress: getClientIp(request),
      },
    });

    return NextResponse.json(restored);
  } catch (error) {
    console.error("Error restoring version:", error);
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 });
  }
}
