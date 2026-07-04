import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const attachments = await prisma.specAttachment.findMany({
      where: { specId: id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ attachments });
  } catch (error) {
    console.error("Failed to fetch attachments:", error);
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const spec = await prisma.spec.findUnique({ where: { id } });
    if (!spec) return NextResponse.json({ error: "Spec not found" }, { status: 404 });

    // Check ownership
    if (spec.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 50MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "bin";
    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join("/home/stephud", "uploads", filename);

    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;
    const fileType = file.type.startsWith("image/") ? "image" : "file";

    const attachment = await prisma.specAttachment.create({
      data: {
        name: name || file.name,
        fileUrl,
        fileType,
        mimeType: file.type,
        size: file.size,
        specId: id,
      },
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    console.error("Failed to create attachment:", error);
    return NextResponse.json({ error: "Failed to create attachment" }, { status: 500 });
  }
}
