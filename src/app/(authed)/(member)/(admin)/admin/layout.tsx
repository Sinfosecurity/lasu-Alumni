import { redirect } from "next/navigation";

import { hasMinRole } from "@/lib/rbac";
import { getSession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!hasMinRole(session.user.role, "EXEC_ADMIN")) redirect("/dashboard");

  return <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>;
}

