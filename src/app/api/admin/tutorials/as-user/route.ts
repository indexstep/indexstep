import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
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
    const admin = await requireAdmin();

    const body = await request.json();
    const { targetUserId, title, description, category, difficulty, timeMinutes, coverImage, tools, steps, published, locked, lockContent, price, customToolConfigs } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }
    if (targetUser.banned) {
      return NextResponse.json({ error: "Cannot post as a banned user" }, { status: 400 });
    }

    if (!title || !description || !category || !difficulty || !timeMinutes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!steps || steps.length === 0) {
      return NextResponse.json({ error: "At least one step is required" }, { status: 400 });
    }

    // Content filtering
    const titleCheck = filterContent(title);
    if (!titleCheck.clean) {
      return NextResponse.json({ error: "Title contains inappropriate content. Please revise." }, { status: 400 });
    }
    const descCheck = filterContent(description);
    if (!descCheck.clean) {
      return NextResponse.json({ error: "Description contains inappropriate content. Please revise." }, { status: 400 });
    }
    for (let i = 0; i < steps.length; i++) {
      const sTitleCheck = filterContent(steps[i].title);
      if (!sTitleCheck.clean) {
        return NextResponse.json({ error: `Step ${i + 1} title contains inappropriate content.` }, { status: 400 });
      }
      const sContentCheck = filterContent(steps[i].content);
      if (!sContentCheck.clean) {
        return NextResponse.json({ error: `Step ${i + 1} content contains inappropriate content.` }, { status: 400 });
      }
    }
    for (const tool of tools || []) {
      const toolCheck = filterContent(tool.name);
      if (!toolCheck.clean) {
        return NextResponse.json({ error: `Tool "${tool.name}" contains inappropriate content.` }, { status: 400 });
      }
    }

    const tutorial = await prisma.tutorial.create({
      data: {
        title,
        description,
        category,
        difficulty: parseInt(difficulty),
        timeMinutes: parseInt(timeMinutes),
        coverImage: coverImage || null,
        published: published ?? false,
        locked: locked ?? false,
        lockContent: lockContent ?? false,
        price: price ? Math.round(price) : 0,
        authorId: targetUserId,
        customToolConfigs: customToolConfigs || null,
        tools: {
          create: (tools || []).map((t: { name: string; quantity?: string; size?: string; kind?: string; notes?: string; category?: string }) => ({
            name: t.name,
            quantity: t.quantity || null,
            size: t.size || null,
            kind: t.kind || null,
            notes: t.notes || null,
            category: t.category || "DIY",
          })),
        },
        steps: {
          create: steps.map((s: { title: string; content: string; imageUrl?: string }, idx: number) => ({
            order: idx + 1,
            title: s.title,
            content: s.content,
            imageUrl: s.imageUrl || null,
          })),
        },
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        tools: true,
        steps: { orderBy: { order: "asc" } },
      },
    });

    await prisma.systemLog.create({
      data: {
        action: "ADMIN_POST_AS_USER",
        target: tutorial.id,
        actorId: admin.id,
        ipAddress: getClientIp(request),
      },
    });

    return NextResponse.json(tutorial, { status: 201 });
  } catch (error) {
    console.error("Admin post-as-user error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create tutorial" }, { status: 500 });
  }
}
