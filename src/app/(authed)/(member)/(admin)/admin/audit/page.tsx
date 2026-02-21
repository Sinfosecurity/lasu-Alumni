import Link from "next/link";

import { prisma } from "@/lib/db";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { email: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin • Audit log</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Administrative activity and system events (security & compliance).
          </p>
        </div>
        <Link className="text-sm underline" href="/admin">
          Back to admin
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">Recent activity</div>
        {logs.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-600">No audit events yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-700">
                <tr>
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">Actor</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                  <th className="px-3 py-2 font-medium">Entity</th>
                  <th className="px-3 py-2 font-medium">Entity ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-2 text-zinc-700">
                      {l.createdAt.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-zinc-700">
                      {l.actor?.email ?? "System"}
                    </td>
                    <td className="px-3 py-2 text-zinc-700">{l.action}</td>
                    <td className="px-3 py-2 text-zinc-700">{l.entity}</td>
                    <td className="px-3 py-2 text-xs text-zinc-600">
                      {l.entityId ?? "—"}
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

