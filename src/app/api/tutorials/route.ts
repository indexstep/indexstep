import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { filterContent } from "@/lib/profanity";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty");
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = {
      published: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = parseInt(difficulty);
    }

    if (timeMin || timeMax) {
      where.timeMinutes = {};
      if (timeMin) (where.timeMinutes as Record<string, number>).gte = parseInt(timeMin);
      if (timeMax) (where.timeMinutes as Record<string, number>).lte = parseInt(timeMax);
    }

    const orderBy: Record<string, string> =
      sort === "oldest"      ? { createdAt: "asc" }
    : sort === "popular"     ? { viewCount: "desc" }
    :                            { createdAt: "desc" };

    const [tutorials, total] = await Promise.all([
      prisma.tutorial.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true },
          },
          _count: {
            select: { steps: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tutorial.count({ where }),
    ]);

    return NextResponse.json({
      tutorials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tutorials:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutorials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, difficulty, timeMinutes, coverImage, tools, steps, published, locked, price, lockContent, customToolConfigs } = body;

    if (!title || !description || !category || !difficulty || !timeMinutes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { error: "At least one step is required" },
        { status: 400 }
      );
    }

    // Check title and description — hard violations block immediately, flagged content gets reviewed
    const titleCheck = filterContent(title);
    if (!titleCheck.clean) {
      return NextResponse.json({ error: "Your title contains prohibited content. Please revise." }, { status: 400 });
    }
    const descCheck = filterContent(description);
    if (!descCheck.clean) {
      return NextResponse.json({ error: "Your description contains prohibited content. Please revise." }, { status: 400 });
    }
    // Check step titles and content
    let flaggedContent: string[] = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const sTitleCheck = filterContent(step.title);
      if (!sTitleCheck.clean) {
        return NextResponse.json({ error: `Step ${i + 1} title contains prohibited content. Please revise.` }, { status: 400 });
      }
      const sContentCheck = filterContent(step.content);
      if (!sContentCheck.clean) {
        return NextResponse.json({ error: `Step ${i + 1} content contains prohibited content. Please revise.` }, { status: 400 });
      }
      if (sTitleCheck.flagged) flaggedContent.push(`Step ${i + 1} title: ${sTitleCheck.flaggedReasons.join(", ")}`);
      if (sContentCheck.flagged) flaggedContent.push(`Step ${i + 1} content: ${sContentCheck.flaggedReasons.join(", ")}`);
    }
    // Check tool names
    for (const tool of tools || []) {
      const toolCheck = filterContent(tool.name);
      if (!toolCheck.clean) {
        return NextResponse.json({ error: `Tool "${tool.name}" contains prohibited content. Please revise.` }, { status: 400 });
      }
      if (toolCheck.flagged) flaggedContent.push(`Tool "${tool.name}": ${toolCheck.flaggedReasons.join(", ")}`);
    }

    // Set flagged status if any content was flagged for review
    const isFlagged = flaggedContent.length > 0;
    const flagReason = flaggedContent.length > 0 ? flaggedContent.slice(0, 5).join(" | ") : null;

    const tutorial = await prisma.tutorial.create({
      data: {
        title,
        description,
        category,
        difficulty: parseInt(difficulty),
        timeMinutes: parseInt(timeMinutes),
        coverImage: coverImage || null,
        published: published || false,
        locked: locked || false,
        lockContent: lockContent || false,
        price: price ? Math.round(price) : 0,
        authorId: user.id,
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
        customToolConfigs: customToolConfigs || null,
        isFlagged,
        flagReason,
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
        author: { select: { id: true, name: true } },
        tools: true,
        steps: { orderBy: { order: "asc" } },
      },
    });

    // Log the creation
    await prisma.systemLog.create({
      data: {
        action: "CREATE_TUTORIAL",
        target: tutorial.id,
        actorId: user.id,
        ipAddress: getClientIp(request),
      },
    });

    return NextResponse.json(tutorial, { status: 201 });
  } catch (error) {
    console.error("Error creating tutorial:", error);
    return NextResponse.json(
      { error: "Failed to create tutorial" },
      { status: 500 }
    );
  }
}
