import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createToken, COOKIE_NAME } from "@/lib/auth";
import { filterContent } from "@/lib/profanity";
import { checkRateLimit } from "@/lib/rateLimit";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many signup attempts. Please try again in a few minutes.",
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, password, name, agreedToTerms } = body;

    if (!agreedToTerms) {
      return NextResponse.json(
        { error: "You must agree to the Terms of Service to create an account." },
        { status: 400 }
      );
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Require .com email addresses
    if (!/^[\w.+-]+@[\w.-]+\.com$/i.test(email)) {
      return NextResponse.json(
        { error: "Email must end with .com" },
        { status: 400 }
      );
    }

    const nameCheck = filterContent(name);
    if (!nameCheck.clean) {
      return NextResponse.json(
        { error: "Your name contains inappropriate content. Please choose a different name." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        ipAddress: getClientIp(request),
        termsAcceptedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(user);
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Log the signup with IP address
    await prisma.systemLog.create({
      data: {
        action: "SIGNUP",
        target: user.id,
        actorId: user.id,
        ipAddress: getClientIp(request),
      },
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
