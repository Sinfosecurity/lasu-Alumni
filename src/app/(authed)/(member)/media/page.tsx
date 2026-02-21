import Link from "next/link";

import { prisma } from "@/lib/db";

export default async function MediaPage() {
  const media = await prisma.mediaItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 24,
    include: { department: true, event: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Media gallery</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Historical photos, reunion media, and document repository (MVP stub).
        </p>
      </div>

      {media.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          No media items yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {media.map((m) => (
            <Link
              key={m.id}
              href={m.url}
              target="_blank"
              className="rounded-xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50"
            >
              <div className="text-xs text-zinc-600">{m.type}</div>
              <div className="mt-2 text-sm font-semibold">{m.title}</div>
              <div className="mt-2 text-xs text-zinc-600">
                {m.department ? m.department.name : "Global"}
                {m.event ? ` • ${m.event.title}` : ""}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

