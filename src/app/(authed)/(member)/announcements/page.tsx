import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function AnnouncementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { departmentId: true },
  });
  if (!user) redirect("/login");

  const announcements = await prisma.announcement.findMany({
    where: {
      publishedAt: { not: null },
      OR: [
        { scope: "GLOBAL" },
        { scope: "DEPARTMENT", departmentId: user.departmentId },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 30,
    include: { department: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Official updates from the executive team and your department.
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          No announcements published yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-zinc-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="text-xs text-zinc-600">
                  {a.scope}
                  {a.department ? ` • ${a.department.name}` : ""}
                  {a.publishedAt ? ` • ${a.publishedAt.toLocaleString()}` : ""}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
                {a.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

