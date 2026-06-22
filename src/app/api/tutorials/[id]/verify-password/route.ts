import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Get tutorial with password
    const tutorialWithPass = await prisma.$queryRaw<{ password: string | null }[]>`SELECT password FROM Tutorial WHERE id = ${id}`;
    const hashedPassword = tutorialWithPass[0]?.password;

    if (!hashedPassword) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, hashedPassword);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Password correct — return full tutorial data
    const tutorial = await prisma.tutorial.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        tools: true,
        steps: { orderBy: { order: "asc" } },
      },
    });

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      isUnlocked: true,
      tutorial: {
        ...tutorial,
        requiresPassword: false,
        isUnlocked: true,
      },
    });
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json({ error: "Failed to verify password" }, { status: 500 });
  }
}
