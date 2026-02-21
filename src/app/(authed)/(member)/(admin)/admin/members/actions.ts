"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { hasMinRole } from "@/lib/rbac";
import { getSession } from "@/lib/session";

async function requireExecAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasMinRole(session.user.role, "EXEC_ADMIN")) throw new Error("Forbidden");
  return session;
}

export async function approveMemberAction(formData: FormData) {
  const session = await requireExecAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) throw new Error("Missing userId");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      status: "ACTIVE",
      approvedAt: new Date(),
      approvedById: session.user.id,
    },
    select: { id: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "MEMBER_APPROVED",
      entity: "User",
      entityId: updated.id,
      metadata: { status: "ACTIVE" },
    },
  });

  revalidatePath("/admin/members");
}

export async function rejectMemberAction(formData: FormData) {
  const session = await requireExecAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) throw new Error("Missing userId");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      status: "REJECTED",
      approvedAt: null,
      approvedById: session.user.id,
    },
    select: { id: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "MEMBER_REJECTED",
      entity: "User",
      entityId: updated.id,
      metadata: { status: "REJECTED" },
    },
  });

  revalidatePath("/admin/members");
}

