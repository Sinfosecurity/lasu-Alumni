import Link from "next/link";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">
          Email verification
        </h1>
        <p className="mt-2 text-sm text-zinc-600">Missing verification token.</p>
        <p className="mt-6 text-sm">
          <Link className="underline" href="/login">
            Go to login
          </Link>
        </p>
      </div>
    );
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true },
  });

  if (!record) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">
          Email verification
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          This verification link is invalid or has already been used.
        </p>
        <p className="mt-6 text-sm">
          <Link className="underline" href="/login">
            Go to login
          </Link>
        </p>
      </div>
    );
  }

  const now = new Date();
  if (record.expiresAt < now) {
    await prisma.emailVerificationToken.delete({ where: { token } });
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">
          Email verification
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          This verification link has expired. Please register again or contact an
          administrator.
        </p>
        <p className="mt-6 text-sm">
          <Link className="underline" href="/register">
            Go to registration
          </Link>
        </p>
      </div>
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Email verified</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Thank you. Your email has been verified. Next, please sign in and await
        admin approval.
      </p>
      <p className="mt-6 text-sm">
        <Link className="underline" href="/login?verified=1">
          Continue to login
        </Link>
      </p>
    </div>
  );
}

