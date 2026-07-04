import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; attachmentId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, attachmentId } = await params;

    const attachment = await prisma.specAttachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    if (attachment.specId !== id) return NextResponse.json({ error: "Attachment does not belong to this spec" }, { status: 400 });

    const spec = await prisma.spec.findUnique({ where: { id } });
    if (!spec) return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    if (spec.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Try to delete the physical file
    try {
      const filepath = path.join("/home/stephud", attachment.fileUrl.replace(/^\//, ""));
      await unlink(filepath);
    } catch {
      // File may not exist on disk, continue
    }

    await prisma.specAttachment.delete({ where: { id: attachmentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete attachment:", error);
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 });
  }
}
