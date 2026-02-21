import Link from "next/link";

import { prisma } from "@/lib/db";

import { createEventAction } from "./actions";

export default async function AdminEventsPage() {
  const [departments, events] = await Promise.all([
    prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      orderBy: { startAt: "desc" },
      take: 20,
      include: { department: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin • Events</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Create and publish events for members to RSVP.
          </p>
        </div>
        <Link className="text-sm underline" href="/admin">
          Back to admin
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">Create event</div>
        <form action={createEventAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-700">Title</label>
            <input
              name="title"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-700">
              Description
            </label>
            <textarea
              name="description"
              className="mt-1 min-h-28 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Start date/time
            </label>
            <input
              name="startAt"
              type="datetime-local"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              End date/time (optional)
            </label>
            <input
              name="endAt"
              type="datetime-local"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Time zone
            </label>
            <input
              name="timeZone"
              defaultValue="Africa/Lagos"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Location (optional)
            </label>
            <input
              name="location"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="e.g., Lagos, Nigeria / Zoom"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Visibility
            </label>
            <select
              name="visibility"
              defaultValue="GLOBAL"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
            >
              <option value="GLOBAL">Global</option>
              <option value="DEPARTMENT">Department</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Department (for department visibility)
            </label>
            <select
              name="departmentId"
              defaultValue=""
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
            >
              <option value="">—</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" name="publishNow" className="size-4" />
              Publish immediately
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
            >
              Create event
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">Recent events</div>
        {events.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-600">No events yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-700">
                <tr>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Start</th>
                  <th className="px-3 py-2 font-medium">Visibility</th>
                  <th className="px-3 py-2 font-medium">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {events.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-2">{e.title}</td>
                    <td className="px-3 py-2">
                      {e.startAt.toLocaleString()} ({e.timeZone})
                    </td>
                    <td className="px-3 py-2">
                      {e.visibility}
                      {e.department ? ` • ${e.department.name}` : ""}
                    </td>
                    <td className="px-3 py-2">{e.publishedAt ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

