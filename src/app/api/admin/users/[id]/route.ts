import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { filterContent } from "@/lib/profanity";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { role, banned, banReason, resetPassword, name, email } = body;

    const isSelf = admin.id === id;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const validRoles = ["USER", "MODERATOR", "ADMIN"];
    if (role !== undefined && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Password reset
    if (resetPassword) {
      if (typeof resetPassword !== "string" || resetPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      const updated = await prisma.user.update({
        where: { id },
        data: { password: await hashPassword(resetPassword) },
        select: { id: true, email: true, name: true },
      });
      await prisma.systemLog.create({
        data: { action: "RESET_PASSWORD", target: id, actorId: admin.id },
      });
      return NextResponse.json({ ...updated, tempPassword: resetPassword });
    }

    // Name/email update
    if (name !== undefined || email !== undefined) {
      if (name !== undefined) {
        const nameCheck = filterContent(name);
        if (!nameCheck.clean) {
          return NextResponse.json({ error: "Name contains inappropriate content. Please choose a different name." }, { status: 400 });
        }
      }
      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }
        const existing = await prisma.user.findFirst({
          where: { email: email.toLowerCase(), NOT: { id } },
        });
        if (existing) {
          return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }
      }
      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email: email.toLowerCase() }),
        },
        select: { id: true, email: true, name: true, role: true, banned: true, banReason: true },
      });
      await prisma.systemLog.create({
        data: { action: "UPDATE_USER_DETAILS", target: id, actorId: admin.id },
      });
      return NextResponse.json(updated);
    }

    // Role / ban update
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role }),
        ...(banned !== undefined && {
          banned,
          banReason: banned ? (banReason || "You have been banned by an administrator.") : null,
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        banned: true,
        banReason: true,
      },
    });

    await prisma.systemLog.create({
      data: {
        action: isSelf ? "UPDATE_OWN_ACCOUNT" : (banned ? "BAN_USER" : role === "ADMIN" ? "PROMOTE_TO_ADMIN" : "DEMOTE_TO_USER"),
        target: id,
        actorId: admin.id,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin user update error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    if (id === admin.id) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    await prisma.systemLog.create({
      data: { action: "DELETE_USER", target: id, actorId: admin.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user delete error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete user. They may have tutorials or purchases blocking deletion." },
      { status: 500 }
    );
  }
}
