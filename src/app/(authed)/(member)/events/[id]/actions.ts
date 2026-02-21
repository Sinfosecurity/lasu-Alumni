"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const RsvpSchema = z.object({
  eventId: z.string().min(1),
  status: z.enum(["GOING", "MAYBE", "NOT_GOING"]),
});

export async function rsvpAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const parsed = RsvpSchema.safeParse({
    eventId: String(formData.get("eventId") ?? ""),
    status: String(formData.get("status") ?? ""),
  });
  if (!parsed.success) throw new Error("Invalid RSVP");

  const { eventId, status } = parsed.data;

  await prisma.eventRsvp.upsert({
    where: { eventId_userId: { eventId, userId: session.user.id } },
    update: { status },
    create: { eventId, userId: session.user.id, status },
  });

  revalidatePath(`/events/${eventId}`);
}

