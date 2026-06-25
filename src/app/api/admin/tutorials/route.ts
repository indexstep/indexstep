import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const tutorials = await prisma.tutorial.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : undefined,
      select: {
        id: true, title: true, description: true, category: true,
        difficulty: true, timeMinutes: true, coverImage: true,
        published: true, locked: true, lockContent: true, price: true,
        "linkOnly": true, viewCount: true, createdAt: true,
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { steps: true, tools: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get passwords separately (libsql adapter strips them from main query)
    const ids = tutorials.map(t => t.id);
    const passwordRows = await prisma.$queryRaw<{ id: string; password: string }[]>`SELECT id, password FROM "Tutorial" WHERE id IN (${ids.join(',')})`;
    const passwordMap = new Map(passwordRows.map(r => [r.id, r.password]));

    const tutorialsWithPassword = tutorials.map(t => ({
      ...t,
      password: passwordMap.get(t.id) || null,
    }));

    return NextResponse.json(tutorialsWithPassword);
  } catch (error) {
    console.error("Admin tutorials error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch tutorials" },
      { status: 500 }
    );
  }
}
