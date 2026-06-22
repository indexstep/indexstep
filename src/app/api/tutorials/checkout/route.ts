import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import stripe from "@/lib/stripe";

// POST /api/tutorials/checkout → create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tutorialId } = await request.json();
    if (!tutorialId) {
      return NextResponse.json({ error: "tutorialId is required" }, { status: 400 });
    }

    const tutorial = await prisma.tutorial.findUnique({
      where: { id: tutorialId },
      include: { author: { select: { id: true, name: true } }, _count: { select: { steps: true } } },
    });

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
    }

    if (!tutorial.locked) {
      return NextResponse.json({ error: "This guide is not locked" }, { status: 400 });
    }

    if (tutorial.authorId === user.id) {
      return NextResponse.json({ error: "You cannot purchase your own guide" }, { status: 400 });
    }

    const existing = await prisma.purchase.findUnique({
      where: { userId_tutorialId: { userId: user.id, tutorialId } },
    });

    if (existing) {
      return NextResponse.json({ error: "You already own this guide" }, { status: 409 });
    }

    // If no Stripe key configured, fall back to instant purchase (dev mode)
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_placeholder") {
      const purchase = await prisma.purchase.create({
        data: { userId: user.id, tutorialId },
      });
      return NextResponse.json({ success: true, purchaseId: purchase.id, devMode: true });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: tutorial.title,
              description: `${tutorial.category} guide by ${tutorial.author.name} • ${tutorial._count?.steps || 0} steps`,
            },
            unit_amount: tutorial.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        tutorialId,
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&tutorialId=${tutorialId}`,
      cancel_url: `${baseUrl}/tutorial/${tutorialId}?cancelled=true`,
      customer_email: user.email,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

// GET /api/tutorials/checkout → verify a Stripe checkout session and create purchase
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_placeholder") {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    if (session.metadata?.userId !== user.id) {
      return NextResponse.json({ error: "Session does not belong to this user" }, { status: 403 });
    }

    const tutorialId = session.metadata?.tutorialId;
    if (!tutorialId) {
      return NextResponse.json({ error: "Tutorial ID not found in session" }, { status: 400 });
    }

    // Check if already purchased
    const existing = await prisma.purchase.findUnique({
      where: { userId_tutorialId: { userId: user.id, tutorialId } },
    });

    if (!existing) {
      await prisma.purchase.create({
        data: { userId: user.id, tutorialId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify checkout error:", error);
    return NextResponse.json({ error: "Failed to verify checkout" }, { status: 500 });
  }
}
