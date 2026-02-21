import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true, emailVerifiedAt: true },
  });
  if (!user) redirect("/login");

  const canEnter =
    Boolean(user.emailVerifiedAt) && user.status === "ACTIVE";
  if (!canEnter) redirect("/pending-approval");

  return <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>;
}

