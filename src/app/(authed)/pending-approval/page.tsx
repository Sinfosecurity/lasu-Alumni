import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function PendingApprovalPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true, emailVerifiedAt: true },
  });
  if (!user) redirect("/login");

  const isEmailVerified = Boolean(user.emailVerifiedAt);
  const canEnter = isEmailVerified === true && user.status === "ACTIVE";
  if (canEnter) redirect("/dashboard");

  const title =
    user.status === "SUSPENDED"
      ? "Account suspended"
      : user.status === "REJECTED"
        ? "Account rejected"
        : isEmailVerified
          ? "Awaiting admin approval"
          : "Verify your email";

  const message =
    user.status === "SUSPENDED"
      ? "Your account has been suspended. Please contact the administrators for help."
      : user.status === "REJECTED"
        ? "Your membership request was rejected. If you believe this is a mistake, please contact the administrators."
        : isEmailVerified
          ? "Your email is verified. An administrator will review and approve your account before you can access member features."
          : "Please verify your email address using the link sent to your inbox. After verification, an administrator will review your membership request.";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-zinc-600">{message}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Contact admin
        </Link>
      </div>
    </div>
  );
}

