import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const spec = await prisma.spec.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ viewCount: spec.viewCount });
  } catch (error) {
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
