import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

// POST /api/webhooks/stripe → Stripe payment webhook
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    // If no webhook secret configured, skip verification (dev mode)
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.log("Stripe webhook secret not configured, skipping verification");
      return NextResponse.json({ received: true });
    }
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const { userId, tutorialId } = session.metadata || {};

    if (!userId || !tutorialId) {
      console.error("Missing metadata in checkout session:", session.id);
      return NextResponse.json({ received: true });
    }

    // Check if already purchased
    const existing = await prisma.purchase.findUnique({
      where: { userId_tutorialId: { userId, tutorialId } },
    });

    if (!existing) {
      await prisma.purchase.create({
        data: { userId, tutorialId },
      });
      console.log(`Purchase created via webhook: user=${userId}, tutorial=${tutorialId}`);
    }
  }

  return NextResponse.json({ received: true });
}
