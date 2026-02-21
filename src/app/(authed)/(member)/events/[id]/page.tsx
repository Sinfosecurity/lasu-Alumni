import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

import { rsvpAction } from "./actions";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: { department: true },
  });

  if (!event || !event.publishedAt) notFound();

  const myRsvp = await prisma.eventRsvp.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: session.user.id } },
    select: { status: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
          <p className="mt-2 text-sm text-zinc-600">
            {event.startAt.toLocaleString()} ({event.timeZone})
            {event.location ? ` • ${event.location}` : ""}
          </p>
          <p className="mt-2 text-xs text-zinc-600">
            Visibility: {event.visibility}
            {event.department ? ` • ${event.department.name}` : ""}
          </p>
        </div>
        <Link className="text-sm underline" href="/events">
          Back to events
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">About this event</div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
          {event.description}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">RSVP</div>
            <div className="mt-1 text-xs text-zinc-600">
              Your current status:{" "}
              <span className="font-medium text-zinc-900">
                {myRsvp?.status ?? "Not set"}
              </span>
            </div>
          </div>
        </div>

        <form action={rsvpAction} className="mt-4 flex flex-wrap gap-3">
          <input type="hidden" name="eventId" value={event.id} />
          <select
            name="status"
            defaultValue={myRsvp?.status ?? "GOING"}
            className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="GOING">Going</option>
            <option value="MAYBE">Maybe</option>
            <option value="NOT_GOING">Not going</option>
          </select>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
          >
            Save RSVP
          </button>
        </form>
      </div>
    </div>
  );
}

