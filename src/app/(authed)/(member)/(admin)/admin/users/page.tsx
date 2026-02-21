import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

import { updateUserRoleAction } from "./actions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { profile: { is: { fullName: { contains: query, mode: "insensitive" } } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { profile: true, department: true },
  });

  const canAssignRoles = session.user.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin • Users</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Search users and manage roles (Super Admin only).
          </p>
        </div>
        <Link className="text-sm underline" href="/admin">
          Back to admin
        </Link>
      </div>

      <form method="get" className="rounded-lg border border-zinc-200 bg-white p-4">
        <label className="block text-xs font-medium text-zinc-700">
          Search (name or email)
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={query}
            className="h-10 w-full flex-1 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
            placeholder="e.g., adeola@… or Adeola"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
          >
            Search
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">Results</div>
        {users.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-600">No users found.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-700">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Department</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {users.map((u) => (
                  <tr key={u.id} className="align-top">
                    <td className="px-3 py-2 text-zinc-900">
                      {u.profile?.fullName ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-zinc-700">{u.email}</td>
                    <td className="px-3 py-2 text-zinc-700">{u.department.name}</td>
                    <td className="px-3 py-2 text-zinc-700">{u.status}</td>
                    <td className="px-3 py-2 text-zinc-700">
                      {canAssignRoles ? (
                        <form action={updateUserRoleAction} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={u.id} />
                          <select
                            name="role"
                            defaultValue={u.role}
                            className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm"
                          >
                            <option value="MEMBER">Member</option>
                            <option value="DEPT_REP">Dept Rep</option>
                            <option value="EXEC_ADMIN">Executive Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>
                          <button
                            type="submit"
                            className="rounded-md bg-brand-700 px-3 py-2 text-xs font-medium text-white hover:bg-brand-800"
                          >
                            Save
                          </button>
                        </form>
                      ) : (
                        u.role
                      )}
                    </td>
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

