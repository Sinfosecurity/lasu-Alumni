import Link from "next/link";

import { prisma } from "@/lib/db";

import { createAnnouncementAction } from "./actions";

export default async function AdminAnnouncementsPage() {
  const [departments, announcements] = await Promise.all([
    prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { department: true, createdBy: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin • Announcements
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Create official updates (global or department).
          </p>
        </div>
        <Link className="text-sm underline" href="/admin">
          Back to admin
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">Create announcement</div>
        <form
          action={createAnnouncementAction}
          className="mt-4 grid gap-4 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-700">Title</label>
            <input
              name="title"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-700">Body</label>
            <textarea
              name="body"
              className="mt-1 min-h-32 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700">Scope</label>
            <select
              name="scope"
              defaultValue="GLOBAL"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
            >
              <option value="GLOBAL">Global</option>
              <option value="DEPARTMENT">Department</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Department (for department scope)
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
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Create announcement
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">Recent announcements</div>
        {announcements.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-600">No announcements yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-700">
                <tr>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Scope</th>
                  <th className="px-3 py-2 font-medium">Published</th>
                  <th className="px-3 py-2 font-medium">Author</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {announcements.map((a) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2">{a.title}</td>
                    <td className="px-3 py-2">
                      {a.scope}
                      {a.department ? ` • ${a.department.name}` : ""}
                    </td>
                    <td className="px-3 py-2">{a.publishedAt ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 text-zinc-700">{a.createdBy.email}</td>
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

