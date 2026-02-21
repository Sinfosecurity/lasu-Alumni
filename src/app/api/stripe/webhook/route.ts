import type Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function markByCheckoutSession(
  checkoutSessionId: string,
  data: {
    status: "PAID" | "FAILED" | "REFUNDED" | "CANCELED";
    paidAt?: Date | null;
    stripePaymentIntentId?: string | null;
  },
) {
  const result = await prisma.payment.updateMany({
    where: { stripeCheckoutSessionId: checkoutSessionId },
    data,
  });

  if (result.count === 0) return null;
  return prisma.payment.findFirst({
    where: { stripeCheckoutSessionId: checkoutSessionId },
    select: { id: true, userId: true },
  });
}

async function markByPaymentIntent(
  paymentIntentId: string,
  data: {
    status: "PAID" | "FAILED" | "REFUNDED" | "CANCELED";
    paidAt?: Date | null;
  },
) {
  const result = await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntentId },
    data,
  });

  if (result.count === 0) return null;
  return prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    select: { id: true, userId: true },
  });
}

export async function POST(req: Request) {
  const stripe = getStripe();

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse("STRIPE_WEBHOOK_SECRET is not set.", { status: 500 });
  }

  const sig = (await headers()).get("stripe-signature");
  if (!sig) return new NextResponse("Missing stripe-signature header.", { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature failed.";
    return new NextResponse(msg, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = session.metadata?.paymentId;
      const checkoutSessionId = session.id;
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : null;

      let updated = null as { id: string; userId: string } | null;

      if (paymentId) {
        const result = await prisma.payment.updateMany({
          where: { id: paymentId },
          data: {
            status: "PAID",
            paidAt: new Date(),
            stripeCheckoutSessionId: checkoutSessionId,
            stripePaymentIntentId: paymentIntentId,
          },
        });

        if (result.count > 0) {
          updated = await prisma.payment.findUnique({
            where: { id: paymentId },
            select: { id: true, userId: true },
          });
        }
      }

      if (!updated) {
        updated = await markByCheckoutSession(checkoutSessionId, {
          status: "PAID",
          paidAt: new Date(),
          stripePaymentIntentId: paymentIntentId,
        });
      }

      if (updated) {
        await prisma.auditLog.create({
          data: {
            actorId: updated.userId,
            action: "PAYMENT_CONFIRMED",
            entity: "Payment",
            entityId: updated.id,
            metadata: { stripeEventId: event.id, type: event.type },
          },
        });
      }

      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const checkoutSessionId = session.id;
      await prisma.payment.updateMany({
        where: { stripeCheckoutSessionId: checkoutSessionId, status: "PENDING" },
        data: { status: "CANCELED" },
      });
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const checkoutSessionId = session.id;
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : null;

      await markByCheckoutSession(checkoutSessionId, {
        status: "FAILED",
        stripePaymentIntentId: paymentIntentId,
      });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await markByPaymentIntent(paymentIntent.id, { status: "FAILED" });
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string" ? charge.payment_intent : null;
      if (paymentIntentId) {
        await markByPaymentIntent(paymentIntentId, { status: "REFUNDED" });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
