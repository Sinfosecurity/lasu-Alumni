import Link from "next/link";

import { prisma } from "@/lib/db";

import { approveMemberAction, rejectMemberAction } from "./actions";

export default async function AdminMembersPage() {
  const pending = await prisma.user.findMany({
    where: { status: "PENDING" },
    include: { profile: true, department: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Member approvals
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Approve verified alumni to activate platform access.
          </p>
        </div>
        <Link className="text-sm underline" href="/admin">
          Back to admin
        </Link>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          No pending membership requests.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-700">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Email verified</th>
                <th className="px-4 py-3 font-medium">Requested</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {pending.map((u) => (
                <tr key={u.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">
                      {u.profile?.fullName ?? "—"}
                    </div>
                    <div className="mt-1 text-xs text-zinc-600">
                      {u.profile?.professionalTitle ?? "—"}
                      {u.profile?.employer ? ` • ${u.profile.employer}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{u.email}</td>
                  <td className="px-4 py-3 text-zinc-700">{u.department.name}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {u.emailVerifiedAt ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {u.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <form action={approveMemberAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button
                          type="submit"
                          className="rounded-md bg-brand-700 px-3 py-2 text-xs font-medium text-white hover:bg-brand-800"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={rejectMemberAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

