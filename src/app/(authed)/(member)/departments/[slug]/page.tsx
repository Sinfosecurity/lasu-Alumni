import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";

export default async function DepartmentHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const department = await prisma.department.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
  if (!department) notFound();

  const [members, announcements, events] = await Promise.all([
    prisma.user.findMany({
      where: { status: "ACTIVE", departmentId: department.id },
      include: { profile: true },
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
    prisma.announcement.findMany({
      where: {
        scope: "DEPARTMENT",
        departmentId: department.id,
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: { id: true, title: true, publishedAt: true },
    }),
    prisma.event.findMany({
      where: {
        visibility: "DEPARTMENT",
        departmentId: department.id,
        publishedAt: { not: null },
      },
      orderBy: { startAt: "asc" },
      take: 5,
      select: { id: true, title: true, startAt: true, timeZone: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {department.name}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">Department hub.</p>
        </div>
        <Link className="text-sm underline" href="/departments">
          All departments
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 md:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-medium">Members</div>
            <Link className="text-xs underline" href={`/directory?department=${department.slug}`}>
              View in directory
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {members.length === 0 ? (
              <div className="text-sm text-zinc-600">No members found.</div>
            ) : (
              members.map((m) => (
                <Link
                  key={m.id}
                  href={`/directory/${m.id}`}
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
                >
                  <div className="font-medium text-zinc-900">
                    {m.profile?.fullName ?? "—"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    {m.profile?.professionalTitle ?? "—"}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="text-sm font-medium">Announcements</div>
            <div className="mt-3 space-y-2 text-sm text-zinc-700">
              {announcements.length === 0 ? (
                <div className="text-sm text-zinc-600">No announcements.</div>
              ) : (
                announcements.map((a) => (
                  <div key={a.id} className="rounded-md bg-zinc-50 px-3 py-2">
                    <div className="font-medium">{a.title}</div>
                    <div className="mt-1 text-xs text-zinc-600">
                      {a.publishedAt?.toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="text-sm font-medium">Upcoming events</div>
            <div className="mt-3 space-y-2 text-sm text-zinc-700">
              {events.length === 0 ? (
                <div className="text-sm text-zinc-600">No events.</div>
              ) : (
                events.map((e) => (
                  <Link
                    key={e.id}
                    href={`/events/${e.id}`}
                    className="block rounded-md bg-zinc-50 px-3 py-2 hover:bg-zinc-100"
                  >
                    <div className="font-medium">{e.title}</div>
                    <div className="mt-1 text-xs text-zinc-600">
                      {e.startAt.toLocaleString()} ({e.timeZone})
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

