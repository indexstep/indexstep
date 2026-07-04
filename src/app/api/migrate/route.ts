import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    // Check if the table already exists
    const existing = await prisma.$queryRaw<{ exists: boolean }[]>(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'SpecAttachment'
      ) AS exists;`
    );

    if (existing[0]?.exists) {
      return NextResponse.json({ success: true, message: "SpecAttachment table already exists" });
    }

    // Create the SpecAttachment table
    await prisma.$executeRaw`
      CREATE TABLE "SpecAttachment" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
        "name" TEXT NOT NULL DEFAULT '',
        "fileUrl" TEXT NOT NULL,
        "fileType" TEXT NOT NULL DEFAULT 'image',
        "mimeType" TEXT,
        "size" INTEGER NOT NULL DEFAULT 0,
        "specId" TEXT NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "SpecAttachment_specId_fkey"
          FOREIGN KEY ("specId") REFERENCES "Spec"("id") ON DELETE CASCADE
      );
    `;

    // Create index
    await prisma.$executeRaw`
      CREATE INDEX "SpecAttachment_specId_idx" ON "SpecAttachment"("specId");
    `;

    return NextResponse.json({ success: true, message: "SpecAttachment table created" });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
