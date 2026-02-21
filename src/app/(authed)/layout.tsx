import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/SignOutButton";
import { hasMinRole } from "@/lib/rbac";
import { getSession } from "@/lib/session";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const showAdmin = hasMinRole(session.user.role, "EXEC_ADMIN");

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex rounded-full bg-white p-0.5 shadow-sm ring-1 ring-zinc-200">
                <span className="relative size-9 overflow-hidden rounded-full">
                  <Image
                    src="/logo.png"
                    alt="LASU Engineering 2001 Alumni"
                    fill
                    sizes="36px"
                    className="object-cover scale-110"
                    priority
                  />
                </span>
              </span>
              <span className="text-sm font-semibold tracking-tight text-zinc-900">
                LASU Eng ’01 Alumni
              </span>
            </Link>
            <nav className="hidden items-center gap-3 text-sm text-zinc-600 md:flex">
              <Link className="hover:text-zinc-900" href="/dashboard">
                Dashboard
              </Link>
              <Link className="hover:text-zinc-900" href="/directory">
                Directory
              </Link>
              <Link className="hover:text-zinc-900" href="/departments">
                Departments
              </Link>
              <Link className="hover:text-zinc-900" href="/events">
                Events
              </Link>
              <Link className="hover:text-zinc-900" href="/payments">
                Payments
              </Link>
              <Link className="hover:text-zinc-900" href="/announcements">
                Announcements
              </Link>
              <Link className="hover:text-zinc-900" href="/media">
                Media
              </Link>
              {showAdmin ? (
                <Link className="hover:text-zinc-900" href="/admin">
                  Admin
                </Link>
              ) : null}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {session.user.isEmailVerified ? null : (
              <span className="hidden rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 sm:inline">
                Email not verified
              </span>
            )}
            {session.user.status !== "ACTIVE" ? (
              <span className="hidden rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-900 sm:inline">
                {session.user.status}
              </span>
            ) : null}
            <SignOutButton />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

