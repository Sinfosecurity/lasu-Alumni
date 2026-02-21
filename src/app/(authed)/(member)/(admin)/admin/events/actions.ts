"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { hasMinRole } from "@/lib/rbac";
import { getSession } from "@/lib/session";

const CreateEventSchema = z
  .object({
    title: z.string().trim().min(3),
    description: z.string().trim().min(10),
    startAt: z.string().trim().min(1),
    endAt: z.string().trim().optional(),
    timeZone: z.string().trim().min(2),
    location: z.string().trim().optional(),
    visibility: z.enum(["GLOBAL", "DEPARTMENT"]),
    departmentId: z.string().trim().optional(),
    publishNow: z.coerce.boolean(),
  })
  .refine(
    (v) => (v.visibility === "DEPARTMENT" ? Boolean(v.departmentId) : true),
    { path: ["departmentId"], message: "Department is required for this visibility." },
  );

export async function createEventAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasMinRole(session.user.role, "EXEC_ADMIN")) throw new Error("Forbidden");

  const parsed = CreateEventSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    startAt: String(formData.get("startAt") ?? ""),
    endAt: String(formData.get("endAt") ?? "").trim() || undefined,
    timeZone: String(formData.get("timeZone") ?? "Africa/Lagos"),
    location: String(formData.get("location") ?? "").trim() || undefined,
    visibility: String(formData.get("visibility") ?? "GLOBAL"),
    departmentId: String(formData.get("departmentId") ?? "").trim() || undefined,
    publishNow: formData.get("publishNow"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid event data");
  }

  const data = parsed.data;
  const startAt = new Date(data.startAt);
  if (Number.isNaN(startAt.getTime())) throw new Error("Invalid start date/time");
  const endAt = data.endAt ? new Date(data.endAt) : null;
  if (endAt && Number.isNaN(endAt.getTime())) throw new Error("Invalid end date/time");

  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      startAt,
      endAt,
      timeZone: data.timeZone,
      location: data.location ?? null,
      visibility: data.visibility,
      departmentId: data.visibility === "DEPARTMENT" ? data.departmentId! : null,
      createdById: session.user.id,
      publishedAt: data.publishNow ? new Date() : null,
    },
    select: { id: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "EVENT_CREATED",
      entity: "Event",
      entityId: event.id,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
}

