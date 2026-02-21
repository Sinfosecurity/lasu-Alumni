"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const UpdateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["MEMBER", "DEPT_REP", "EXEC_ADMIN", "SUPER_ADMIN"]),
});

export async function updateUserRoleAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  const parsed = UpdateRoleSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    role: String(formData.get("role") ?? ""),
  });
  if (!parsed.success) throw new Error("Invalid role update");

  const { userId, role } = parsed.data;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "ROLE_UPDATED",
      entity: "User",
      entityId: updated.id,
      metadata: { role },
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/members");
}

