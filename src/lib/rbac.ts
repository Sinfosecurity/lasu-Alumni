import type { Role } from "@/generated/prisma/client";

const ROLE_RANK: Record<Role, number> = {
  MEMBER: 0,
  DEPT_REP: 1,
  EXEC_ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function hasMinRole(userRole: Role, minRole: Role) {
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole];
}

