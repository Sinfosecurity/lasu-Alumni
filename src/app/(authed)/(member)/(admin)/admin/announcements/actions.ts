"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { hasMinRole } from "@/lib/rbac";
import { getSession } from "@/lib/session";

const CreateAnnouncementSchema = z
  .object({
    title: z.string().trim().min(3),
    body: z.string().trim().min(10),
    scope: z.enum(["GLOBAL", "DEPARTMENT"]),
    departmentId: z.string().trim().optional(),
    publishNow: z.coerce.boolean(),
  })
  .refine((v) => (v.scope === "DEPARTMENT" ? Boolean(v.departmentId) : true), {
    path: ["departmentId"],
    message: "Department is required for department scope.",
  });

export async function createAnnouncementAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const parsed = CreateAnnouncementSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    scope: String(formData.get("scope") ?? "GLOBAL"),
    departmentId: String(formData.get("departmentId") ?? "").trim() || undefined,
    publishNow: formData.get("publishNow"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid announcement");
  }

  const data = parsed.data;

  // Executive admins can post globally; department reps are restricted to their department.
  if (data.scope === "GLOBAL" && !hasMinRole(session.user.role, "EXEC_ADMIN")) {
    throw new Error("Forbidden");
  }

  const actor = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { departmentId: true, role: true },
  });
  if (!actor) throw new Error("Unauthorized");

  const departmentId =
    actor.role === "DEPT_REP" ? actor.departmentId : data.departmentId ?? null;

  if (data.scope === "DEPARTMENT" && !departmentId) {
    throw new Error("Department is required.");
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: data.title,
      body: data.body,
      scope: data.scope,
      departmentId: data.scope === "DEPARTMENT" ? departmentId : null,
      createdById: session.user.id,
      publishedAt: data.publishNow ? new Date() : null,
    },
    select: { id: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "ANNOUNCEMENT_CREATED",
      entity: "Announcement",
      entityId: announcement.id,
    },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
}

