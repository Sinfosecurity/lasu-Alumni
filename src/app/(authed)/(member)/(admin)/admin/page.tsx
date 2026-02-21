import Link from "next/link";

import { prisma } from "@/lib/db";

function formatMoney(amountMinor: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }
}

export default async function AdminHomePage() {
  const currency = (process.env.PAYMENTS_CURRENCY ?? "NGN").toUpperCase();
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [
    pendingCount,
    memberCount,
    paymentCount,
    upcomingEventsCount,
    publishedAnnouncementCount,
    paidLifetime,
    paidThisMonth,
    paymentStatusBreakdown,
  ] = await Promise.all([
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.payment.count(),
    prisma.event.count({
      where: { publishedAt: { not: null }, startAt: { gte: now } },
    }),
    prisma.announcement.count({ where: { publishedAt: { not: null } } }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const paidLifetimeMinor = paidLifetime._sum.amount ?? 0;
  const paidThisMonthMinor = paidThisMonth._sum.amount ?? 0;
  const paidThisMonthCount = paidThisMonth._count._all ?? 0;
  const statusCounts = Object.fromEntries(
    paymentStatusBreakdown.map((item) => [item.status, item._count._all]),
  ) as Partial<Record<"PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELED", number>>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Membership approvals, content, events, and finances.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium">Pending approvals</div>
          <div className="mt-1 text-2xl font-semibold">{pendingCount}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium">Active members</div>
          <div className="mt-1 text-2xl font-semibold">{memberCount}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium">Payments recorded</div>
          <div className="mt-1 text-2xl font-semibold">{paymentCount}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium">Paid revenue (all-time)</div>
          <div className="mt-1 text-2xl font-semibold">
            {formatMoney(paidLifetimeMinor, currency)}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium">Paid this month</div>
          <div className="mt-1 text-2xl font-semibold">
            {formatMoney(paidThisMonthMinor, currency)}
          </div>
          <div className="mt-1 text-xs text-zinc-600">
            {paidThisMonthCount} successful payment(s)
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium">Upcoming events</div>
          <div className="mt-1 text-2xl font-semibold">{upcomingEventsCount}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium">Payment status mix</div>
          <div className="mt-3 space-y-2 text-sm text-zinc-700">
            <div className="flex items-center justify-between gap-3">
              <span>PAID</span>
              <span className="font-medium">{statusCounts.PAID ?? 0}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>PENDING</span>
              <span className="font-medium">{statusCounts.PENDING ?? 0}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>FAILED</span>
              <span className="font-medium">{statusCounts.FAILED ?? 0}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>CANCELED</span>
              <span className="font-medium">{statusCounts.CANCELED ?? 0}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>REFUNDED</span>
              <span className="font-medium">{statusCounts.REFUNDED ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium">Content snapshot</div>
          <div className="mt-3 space-y-2 text-sm text-zinc-700">
            <div className="flex items-center justify-between gap-3">
              <span>Published announcements</span>
              <span className="font-medium">{publishedAnnouncementCount}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Upcoming published events</span>
              <span className="font-medium">{upcomingEventsCount}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Pending approvals</span>
              <span className="font-medium">{pendingCount}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Active members</span>
              <span className="font-medium">{memberCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/members"
          className="rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
        >
          <div className="text-sm font-medium">Member approvals</div>
          <div className="mt-1 text-sm text-zinc-600">
            Approve or reject membership requests.
          </div>
        </Link>
        <Link
          href="/admin/events"
          className="rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
        >
          <div className="text-sm font-medium">Events</div>
          <div className="mt-1 text-sm text-zinc-600">
            Create and publish events for RSVPs.
          </div>
        </Link>
        <Link
          href="/admin/announcements"
          className="rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
        >
          <div className="text-sm font-medium">Announcements</div>
          <div className="mt-1 text-sm text-zinc-600">
            Publish executive and department updates.
          </div>
        </Link>
        <Link
          href="/admin/payments"
          className="rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
        >
          <div className="text-sm font-medium">Payments</div>
          <div className="mt-1 text-sm text-zinc-600">
            View dues, donations, and event fees.
          </div>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
        >
          <div className="text-sm font-medium">Users & roles</div>
          <div className="mt-1 text-sm text-zinc-600">
            Search users and assign roles (Super Admin).
          </div>
        </Link>
        <Link
          href="/admin/audit"
          className="rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
        >
          <div className="text-sm font-medium">Audit log</div>
          <div className="mt-1 text-sm text-zinc-600">
            Review administrative activity.
          </div>
        </Link>
      </div>
    </div>
  );
}
