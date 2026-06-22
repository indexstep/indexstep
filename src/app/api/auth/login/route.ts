import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createToken, COOKIE_NAME } from "@/lib/auth";
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

  // Return rate limit info in headers even on success
  const withHeaders = (res: NextResponse) => {
    res.headers.set("X-RateLimit-Limit", String(20));
    res.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    res.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetAt / 1000)));
    return res;
  };

  if (!rateLimit.allowed) {
    return withHeaders(
      NextResponse.json(
        {
          error: "Too many login attempts. Please try again in a few minutes.",
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      )
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return withHeaders(
        NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        )
      );
    }

    // Require .com email addresses
    if (!/^[\w.+-]+@[\w.-]+\.com$/i.test(email)) {
      return withHeaders(
        NextResponse.json(
          { error: "Email must end with .com" },
          { status: 400 }
        )
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.banned) {
      return NextResponse.json(
        {
          error: "Account has been suspended",
          banReason: user.banReason || "You have been banned by an administrator. Contact support for more information.",
        },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Log the login with IP address
    await prisma.systemLog.create({
      data: {
        action: "LOGIN",
        target: user.id,
        actorId: user.id,
        ipAddress: getClientIp(request),
      },
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
