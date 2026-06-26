import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { filterContent } from "@/lib/profanity";

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, email, profilePicture, backgroundImage, backgroundPosition, age, gender, country } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const nameCheck = filterContent(name.trim());
    if (!nameCheck.clean) {
      return NextResponse.json({ error: "Your name contains inappropriate content. Please choose a different name." }, { status: 400 });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        ...(email && { email }),
        ...(profilePicture !== undefined && { profilePicture }),
        ...(backgroundImage !== undefined && { backgroundImage }),
        ...(backgroundPosition !== undefined && { backgroundPosition }),
        ...(age !== undefined && { age: age ? parseInt(age) : null }),
        ...(gender !== undefined && { gender: gender || null }),
        ...(country !== undefined && { country: country || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePicture: true,
        backgroundImage: true,
        backgroundPosition: true,
        age: true,
        gender: true,
        country: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Profile update error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
