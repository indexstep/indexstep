import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { filterContent } from "@/lib/profanity";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

// Detect gibberish/random content — flags tutorials with very short random-looking strings
function detectSuspiciousContent(title: string, description: string, steps: { title: string; content: string }[]): { suspicious: boolean; reason: string } {
  // Check for extremely short content
  if (title.length < 3 || description.length < 10) {
    return { suspicious: true, reason: "Title or description is suspiciously short" };
  }

  // Check for gibberish patterns (repeated chars, no spaces, etc.)
  const gibberishPatterns = [
    /^(.)\1{5,}$/,                        // same char repeated 6+ times
    /^[a-zA-Z0-9]{30,}$/,                 // long alphanumeric string with no spaces
    /^[!@#$%^&*()]{10,}$/,               // only special chars
    /\b(fuck|sex|xxx|scam|hack)\b/i,     // obvious bad words
  ];

  for (const step of steps) {
    for (const pattern of gibberishPatterns) {
      if (pattern.test(step.title) || pattern.test(step.content)) {
        return { suspicious: true, reason: `Step contains gibberish or inappropriate content: "${step.title}"` };
      }
    }
    // Step content too short (less than 10 chars)
    if (step.content.length < 10 && step.content.length > 0) {
      return { suspicious: true, reason: `Step content is suspiciously short: "${step.title}"` };
    }
  }

  // Random data injection detection: if title or step titles are all identical
  const titles = [title, ...steps.map(s => s.title)].filter(Boolean);
  const uniqueTitles = new Set(titles.map(t => t.toLowerCase().trim()));
  if (uniqueTitles.size === 1 && titles.length > 2) {
    return { suspicious: true, reason: "All step titles are identical — possible data injection" };
  }

  return { suspicious: false, reason: "" };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tutorial = await prisma.tutorial.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        tools: true,
        steps: { orderBy: { order: "asc" } },
      },
    });

    // Extra query to get password and linkOnly (libsql adapter strips them from main query)
    let tutorialPassword: string | null = null;
    let tutorialLinkOnly = false;
    try {
      const extraResult = await prisma.$queryRaw<{ password: string | null; linkOnly: boolean }[]>`SELECT password, linkOnly FROM Tutorial WHERE id = ${id}`;
      tutorialPassword = extraResult[0]?.password || null;
      tutorialLinkOnly = extraResult[0]?.linkOnly || false;
    } catch (e) {
      console.error("Error fetching extra fields:", e);
    }

    if (!tutorial) {
      return NextResponse.json(
        { error: "Tutorial not found" },
        { status: 404 }
      );
    }

    if (!tutorial.published && !tutorialLinkOnly) {
      const user = await getCurrentUser();
      if (!user || (user.role !== "ADMIN" && user.id !== tutorial.authorId)) {
        return NextResponse.json(
          { error: "Tutorial not found" },
          { status: 404 }
        );
      }
    }

    const user = await getCurrentUser();
    // Admins and authors can always see password-protected tutorials
    const isAdminOrAuthor = user && (user.role === "ADMIN" || user.role === "MODERATOR" || user.id === tutorial.authorId);

    if (tutorialPassword) {
      if (!isAdminOrAuthor) {
        // Return minimal info — no steps, no tools
        const { steps, tools, ...rest } = tutorial;
        return NextResponse.json({
          ...rest,
          linkOnly: tutorialLinkOnly,
          requiresPassword: true,
          isUnlocked: false,
          author: tutorial.author,
        });
      }
    }

    return NextResponse.json({ ...tutorial, linkOnly: tutorialLinkOnly, requiresPassword: false, isUnlocked: true });
  } catch (error) {
    console.error("Error fetching tutorial:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutorial" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const tutorial = await prisma.tutorial.findUnique({ where: { id }, include: { steps: true, tools: true } });

    // Get current password (libsql adapter strips it from main query)
    let tutorialPassword: string | null = null;
    try {
      const pwResult = await prisma.$queryRaw<{ password: string }[]>`SELECT password FROM Tutorial WHERE id = ${id}`;
      tutorialPassword = pwResult[0]?.password || null;
    } catch (e) {
      console.error("Error fetching password:", e);
    }

    if (!tutorial) {
      return NextResponse.json(
        { error: "Tutorial not found" },
        { status: 404 }
      );
    }

    if (user.role !== "MODERATOR" && user.role !== "ADMIN" && user.id !== tutorial.authorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, difficulty, timeMinutes, coverImage, tools, steps, published, locked, price, lockContent, customToolConfigs, editReason, password, linkOnly } = body;

    // Content filter — reject if profanity detected
    if (title) {
      const t = filterContent(title);
      if (!t.clean) return NextResponse.json({ error: "Title contains inappropriate content." }, { status: 400 });
    }
    if (description) {
      const d = filterContent(description);
      if (!d.clean) return NextResponse.json({ error: "Description contains inappropriate content." }, { status: 400 });
    }
    if (steps) {
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        if (s.title && !filterContent(s.title).clean) return NextResponse.json({ error: `Step ${i + 1} title contains inappropriate content.` }, { status: 400 });
        if (s.content && !filterContent(s.content).clean) return NextResponse.json({ error: `Step ${i + 1} content contains inappropriate content.` }, { status: 400 });
      }
    }

    const ip = getClientIp(request);
    const now = new Date();
    let isSuspicious = false;
    let flagReason = "";

    // ─── Rate-limit abuse detection ───
    // If user edited this tutorial more than 5 times in the last 10 minutes, flag it
    const recentEdits = await prisma.tutorialVersion.count({
      where: {
        tutorialId: id,
        editedAt: { gte: new Date(now.getTime() - 10 * 60 * 1000) },
      },
    });

    if (recentEdits >= 5) {
      isSuspicious = true;
      flagReason = `Rapid edits: ${recentEdits} edits in 10 minutes`;
    }

    // ─── Content gibberish detection ───
    if (steps) {
      const contentCheck = detectSuspiciousContent(
        title || tutorial.title,
        description || tutorial.description,
        steps.map((s: { title: string; content: string }) => ({ title: s.title || "", content: s.content || "" }))
      );
      if (contentCheck.suspicious) {
        isSuspicious = true;
        flagReason = contentCheck.reason;
      }
    }

    // ─── Save version snapshot BEFORE updating ───
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
        editReason: editReason || null,
        isFlagged: isSuspicious,
      },
    });

    // ─── Delete existing tools and steps ───
    await prisma.tool.deleteMany({ where: { tutorialId: id } });
    await prisma.step.deleteMany({ where: { tutorialId: id } });

    // ─── Update tutorial ───
    const updated = await prisma.tutorial.update({
      where: { id },
      data: {
        title: title || tutorial.title,
        description: description || tutorial.description,
        category: category || tutorial.category,
        difficulty: difficulty ? parseInt(difficulty) : tutorial.difficulty,
        timeMinutes: timeMinutes ? parseInt(timeMinutes) : tutorial.timeMinutes,
        coverImage: coverImage !== undefined ? coverImage : tutorial.coverImage,
        published: published !== undefined ? published : tutorial.published,
        locked: locked !== undefined ? locked : tutorial.locked,
        lockContent: lockContent !== undefined ? lockContent : tutorial.lockContent,
        price: price !== undefined ? Math.round(price) : tutorial.price,
        linkOnly: linkOnly !== undefined ? linkOnly : (tutorial as any).linkOnly || false,
        password: password !== undefined ? (password ? await bcrypt.hash(password, 10) : null) : tutorialPassword,
        tools: tools ? {
          create: tools.map((t: { name: string; quantity?: string; size?: string; kind?: string; notes?: string; category?: string }) => ({
            name: t.name,
            quantity: t.quantity || null,
            size: t.size || null,
            kind: t.kind || null,
            notes: t.notes || null,
            category: t.category || "DIY",
          })),
        } : undefined,
        customToolConfigs: customToolConfigs !== undefined ? customToolConfigs : tutorial.customToolConfigs,
        steps: steps ? {
          create: steps.map((s: { title: string; content: string; imageUrl?: string }, idx: number) => ({
            order: idx + 1,
            title: s.title,
            content: s.content,
            imageUrl: s.imageUrl || null,
          })),
        } : undefined,
        editCount: { increment: 1 },
        lastEditAt: now,
        isFlagged: isSuspicious,
        flagReason: isSuspicious ? flagReason : null,
      },
      include: {
        author: { select: { id: true, name: true } },
        tools: true,
        steps: { orderBy: { order: "asc" } },
      },
    });

    // ─── System log ───
    await prisma.systemLog.create({
      data: {
        action: isSuspicious ? "SUSPICIOUS_EDIT" : "UPDATE_TUTORIAL",
        target: id,
        actorId: user.id,
        ipAddress: ip,
      },
    });

    // ─── Notify admins if suspicious ───
    if (isSuspicious) {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true, email: true, name: true },
      });

      // Create a report for admin review
      await prisma.report.create({
        data: {
          type: "TUTORIAL",
          reason: `Suspicious edit detected on tutorial "${title || tutorial.title}": ${flagReason}. Edited by ${user.name} (${user.email}). IP: ${ip}`,
          reporterId: user.id,
          tutorialId: id,
          status: "PENDING",
        },
      });

      console.warn(`[SECURITY] Suspicious edit flagged on tutorial ${id}: ${flagReason} by user ${user.email} (${user.id}) from IP ${ip}`);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating tutorial:", error);
    return NextResponse.json(
      { error: "Failed to update tutorial" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const tutorial = await prisma.tutorial.findUnique({ where: { id } });

    if (!tutorial) {
      return NextResponse.json(
        { error: "Tutorial not found" },
        { status: 404 }
      );
    }

    if (user.role !== "MODERATOR" && user.role !== "ADMIN" && user.id !== tutorial.authorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.tutorial.delete({ where: { id } });

    await prisma.systemLog.create({
      data: {
        action: "DELETE_TUTORIAL",
        target: id,
        actorId: user.id,
        ipAddress: getClientIp(request),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tutorial:", error);
    return NextResponse.json(
      { error: "Failed to delete tutorial" },
      { status: 500 }
    );
  }
}
