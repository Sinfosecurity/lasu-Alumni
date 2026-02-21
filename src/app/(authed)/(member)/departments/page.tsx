import Link from "next/link";

import { prisma } from "@/lib/db";

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Department hubs</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Access member lists, announcements, leadership, and events by
          department.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {departments.map((d) => (
          <Link
            key={d.id}
            href={`/departments/${d.slug}`}
            className="rounded-xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50"
          >
            <div className="text-sm font-semibold">{d.name}</div>
            <div className="mt-2 text-sm text-zinc-600">
              View members, announcements, and events.
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

