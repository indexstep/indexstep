import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

const MAX_IMAGE_SIZE = 500 * 1024; // 500KB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];

// POST /api/admin/badges/[id]/image - Upload badge image (base64)
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { imageData } = body; // base64 data URL

    if (!imageData || typeof imageData !== "string") {
      return NextResponse.json({ error: "imageData is required" }, { status: 400 });
    }

    if (!imageData.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    if (imageData.length > MAX_IMAGE_SIZE * 2) {
      // rough estimate since base64 has ~4/3 overhead
      return NextResponse.json({ error: "Image too large. Max 500KB." }, { status: 400 });
    }

    const badge = await prisma.badge.update({
      where: { id },
      data: { imageData, imageUrl: null },
    });

    return NextResponse.json({ message: "Image uploaded", badge });
  } catch (error) {
    console.error("Failed to upload badge image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

// DELETE /api/admin/badges/[id]/image - Remove badge image
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.badge.update({
      where: { id },
      data: { imageData: null, imageUrl: null },
    });

    return NextResponse.json({ message: "Image removed" });
  } catch (error) {
    console.error("Failed to remove badge image:", error);
    return NextResponse.json({ error: "Failed to remove image" }, { status: 500 });
  }
}
