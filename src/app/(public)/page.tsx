import Link from "next/link";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const news = await prisma.announcement.findMany({
    where: { scope: "GLOBAL", publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { id: true, title: true, publishedAt: true },
  });

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-medium text-brand-800">
                LASU Engineering 2001 Global Alumni Digital Platform
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                The official global headquarters for LASU Engineering Class of
                2001.
              </h1>
              <p className="mt-5 text-base leading-7 text-zinc-700">
                Secure, membership-based platform for global engagement,
                governance operations, events & reunions, and transparent
                financial management—preserving our legacy for generations.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-brand-700 px-5 text-sm font-medium text-white hover:bg-brand-800"
                >
                  Request membership
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                >
                  Member login
                </Link>
              </div>

              <div className="mt-8 text-sm text-zinc-600">
                Departments: Mechanical Engineering • Electronic & Computer
                Engineering • Chemical & Polymer Engineering
              </div>
            </div>

            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium text-zinc-900">
                What you can do on the platform
              </div>
              <ul className="mt-4 space-y-3 text-sm text-zinc-700">
                <li>
                  - Verified member directory (search by department, country,
                  profession)
                </li>
                <li>- Department hubs for announcements and events</li>
                <li>- Events & reunion RSVPs (tickets in MVP)</li>
                <li>- Annual dues and donations (Stripe integration)</li>
                <li>- Official governance announcements and document sharing</li>
                <li>- Media & legacy archive (photos, documents, achievements)</li>
              </ul>
              <div className="mt-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900">
                <span className="font-medium">Security:</span> encrypted
                passwords, role-based access control, admin approval workflow,
                and activity logs.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-medium">Global directory</div>
            <p className="mt-2 text-sm text-zinc-600">
              Find classmates by department, country, and profession—while
              respecting contact preferences.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-medium">Events & reunions</div>
            <p className="mt-2 text-sm text-zinc-600">
              Create events, manage RSVPs, track attendance, and maintain a
              searchable archive.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-medium">Governance & finance</div>
            <p className="mt-2 text-sm text-zinc-600">
              Official announcements, financial reporting (admin-only), and
              audit logs for transparency.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              News highlights
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Official updates from the executive team (when published).
            </p>
          </div>
          <Link className="text-sm underline" href="/login">
            View all (members)
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {news.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 md:col-span-3">
              No published updates yet.
            </div>
          ) : (
            news.map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-zinc-200 bg-white p-5"
              >
                <div className="text-sm font-medium">{n.title}</div>
                <div className="mt-2 text-xs text-zinc-600">
                  {n.publishedAt?.toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-2xl bg-zinc-900 px-6 py-10 text-white">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Ready to join the global alumni institution?
              </h2>
              <p className="mt-3 text-sm text-zinc-200">
                Request membership to access the directory, events, department
                hubs, and payments.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Request membership
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-md border border-white/20 bg-white/10 px-5 text-sm font-medium text-white hover:bg-white/15"
              >
                Contact executive team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
