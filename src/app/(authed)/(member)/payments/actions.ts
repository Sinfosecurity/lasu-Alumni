"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { getSession } from "@/lib/session";

const StartCheckoutSchema = z.object({
  type: z.enum(["DUES", "DONATION"]),
  donationAmount: z.string().optional(),
});

function getCurrency() {
  return (process.env.PAYMENTS_CURRENCY ?? "NGN").toUpperCase();
}

function getAnnualDuesAmountMinor() {
  const raw = process.env.ANNUAL_DUES_AMOUNT_MINOR ?? "1000000"; // ₦10,000 default
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("Invalid ANNUAL_DUES_AMOUNT_MINOR");
  }
  return n;
}

export async function startCheckoutAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const parsed = StartCheckoutSchema.safeParse({
    type: String(formData.get("type") ?? ""),
    donationAmount: String(formData.get("donationAmount") ?? "").trim() || undefined,
  });
  if (!parsed.success) throw new Error("Invalid payment request");

  const currency = getCurrency();
  const stripe = getStripe();

  let amountMinor = 0;
  let description = "";

  if (parsed.data.type === "DUES") {
    amountMinor = getAnnualDuesAmountMinor();
    description = "Annual dues";
  } else {
    const amountMajor = Number(parsed.data.donationAmount);
    if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
      throw new Error("Donation amount is required.");
    }
    amountMinor = Math.round(amountMajor * 100);
    if (amountMinor < 100) throw new Error("Minimum donation is 1.00.");
    description = "Donation";
  }

  const payment = await prisma.payment.create({
    data: {
      userId: session.user.id,
      type: parsed.data.type,
      status: "PENDING",
      amount: amountMinor,
      currency,
      description,
    },
    select: { id: true },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${baseUrl}/payments?success=1`,
    cancel_url: `${baseUrl}/payments?canceled=1`,
    customer_email: session.user.email ?? undefined,
    metadata: { paymentId: payment.id, type: parsed.data.type },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: amountMinor,
          product_data: {
            name: `LASU Engineering 2001 Alumni — ${description}`,
          },
        },
      },
    ],
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { stripeCheckoutSessionId: checkout.id },
  });

  if (!checkout.url) throw new Error("Stripe checkout URL missing.");
  redirect(checkout.url);
}

