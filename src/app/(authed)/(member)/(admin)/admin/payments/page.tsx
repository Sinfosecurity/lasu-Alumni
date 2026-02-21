import Link from "next/link";

import { prisma } from "@/lib/db";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { email: true } }, event: { select: { title: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin • Payments</h1>
          <p className="mt-2 text-sm text-zinc-600">
            View dues, event fees, and donations (Stripe will update statuses via webhooks).
          </p>
        </div>
        <Link className="text-sm underline" href="/admin">
          Back to admin
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">Recent payments</div>
        {payments.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-600">No payments recorded yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-700">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Member</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 text-zinc-700">
                      {p.createdAt.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-zinc-700">{p.user.email}</td>
                    <td className="px-3 py-2 text-zinc-700">
                      {p.type}
                      {p.event ? ` • ${p.event.title}` : ""}
                    </td>
                    <td className="px-3 py-2 text-zinc-700">
                      {(p.amount / 100).toFixed(2)} {p.currency}
                    </td>
                    <td className="px-3 py-2 text-zinc-700">{p.status}</td>
                    <td className="px-3 py-2 text-xs text-zinc-600">
                      {p.stripeCheckoutSessionId ?? "—"}
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

