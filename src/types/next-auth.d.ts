import "next-auth";
import "next-auth/jwt";

import type { MemberStatus, Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      role: Role;
      status: MemberStatus;
      departmentId: string;
      isEmailVerified: boolean;
    };
  }

  interface User {
    id: string;
    role: Role;
    status: MemberStatus;
    departmentId: string;
    isEmailVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status: MemberStatus;
    departmentId: string;
    isEmailVerified: boolean;
  }
}

