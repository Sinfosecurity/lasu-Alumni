import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

import { startCheckoutAction } from "./actions";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { success, canceled } = await searchParams;

  const payments = await prisma.payment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY);
  const currency = (process.env.PAYMENTS_CURRENCY ?? "NGN").toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment portal</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Annual dues, event fees, and donations via Stripe Checkout.
        </p>
      </div>

      {success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Payment completed. Your receipt will appear in your payment history once
          confirmed.
        </div>
      ) : null}

      {canceled ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Payment canceled.
        </div>
      ) : null}

      {!stripeReady ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Stripe is not configured yet. Set `STRIPE_SECRET_KEY` and
          `STRIPE_WEBHOOK_SECRET` to enable real checkout and confirmations.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="text-sm font-medium">Annual dues</div>
            <p className="mt-2 text-sm text-zinc-600">
              Pay your annual dues securely via Stripe Checkout.
            </p>
            <form action={startCheckoutAction} className="mt-4">
              <input type="hidden" name="type" value="DUES" />
              <button
                type="submit"
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Pay annual dues ({currency})
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="text-sm font-medium">Donation</div>
            <p className="mt-2 text-sm text-zinc-600">
              Support projects and legacy initiatives.
            </p>
            <form action={startCheckoutAction} className="mt-4 flex gap-2">
              <input type="hidden" name="type" value="DONATION" />
              <input
                name="donationAmount"
                type="number"
                min="1"
                step="0.01"
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                placeholder="Amount"
                required
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Donate
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">Payment history</div>
        {payments.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-600">
            No payment records yet.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-700">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Checkout Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 text-zinc-700">
                      {p.createdAt.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-zinc-700">{p.type}</td>
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
