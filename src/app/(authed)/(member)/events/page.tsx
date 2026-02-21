import Link from "next/link";

import { prisma } from "@/lib/db";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      startAt: true,
      endAt: true,
      timeZone: true,
      location: true,
      visibility: true,
    },
  });

  const now = new Date();
  const upcoming = events.filter((e) => e.startAt >= now);
  const past = events.filter((e) => e.startAt < now).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="mt-2 text-sm text-zinc-600">
            RSVP for upcoming events and reunions.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-900">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No upcoming events yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                className="rounded-xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-sm font-semibold">{e.title}</div>
                  <div className="text-xs text-zinc-600">{e.visibility}</div>
                </div>
                <div className="mt-2 text-xs text-zinc-600">
                  {e.startAt.toLocaleString()} ({e.timeZone})
                </div>
                {e.location ? (
                  <div className="mt-2 text-xs text-zinc-600">{e.location}</div>
                ) : null}
                <p className="mt-3 line-clamp-3 text-sm text-zinc-700">
                  {e.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-900">Past events</h2>
        {past.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No past events yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {past.slice(0, 10).map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50"
              >
                <div>
                  <div className="text-sm font-medium">{e.title}</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    {e.startAt.toLocaleDateString()} ({e.timeZone})
                  </div>
                </div>
                <div className="text-xs text-zinc-600">{e.visibility}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

