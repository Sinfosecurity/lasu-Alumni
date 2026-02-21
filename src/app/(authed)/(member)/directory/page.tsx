import Link from "next/link";
import { redirect } from "next/navigation";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    department?: string;
    country?: string;
    profession?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [{ q, department, country, profession }, departments] = await Promise.all([
    searchParams,
    prisma.department.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const profileWhere: Prisma.ProfileWhereInput = {};
  if (q?.trim())
    profileWhere.fullName = { contains: q.trim(), mode: "insensitive" };
  if (country?.trim())
    profileWhere.country = { contains: country.trim(), mode: "insensitive" };
  if (profession?.trim())
    profileWhere.professionalTitle = {
      contains: profession.trim(),
      mode: "insensitive",
    };

  const where: Prisma.UserWhereInput = { status: "ACTIVE" };
  if (department?.trim()) {
    where.department = { is: { slug: department.trim() } };
  }
  if (Object.keys(profileWhere).length > 0) {
    where.profile = { is: profileWhere };
  }

  const members = await prisma.user.findMany({
    where,
    include: { profile: true, department: true },
    take: 60,
    orderBy: [{ createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alumni directory</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Search verified members by department, country, profession, or name.
        </p>
      </div>

      <form
        method="get"
        className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-4"
      >
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-zinc-700">Name</label>
          <input
            name="q"
            defaultValue={q ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
            placeholder="Search by full name…"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700">
            Department
          </label>
          <select
            name="department"
            defaultValue={department ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700">
            Country
          </label>
          <input
            name="country"
            defaultValue={country ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
            placeholder="e.g., Nigeria"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-zinc-700">
            Profession
          </label>
          <input
            name="profession"
            defaultValue={profession ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
            placeholder="e.g., Petroleum Engineer"
          />
        </div>
        <div className="flex items-end gap-2 md:col-span-2 md:justify-end">
          <Link
            href="/directory"
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Reset
          </Link>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
          >
            Search
          </button>
        </div>
      </form>

      <div className="text-sm text-zinc-600">
        Showing <span className="font-medium text-zinc-900">{members.length}</span>{" "}
        result(s).
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {members.map((m) => {
          const p = m.profile;
          const showContact = p?.contactPreference !== "PRIVATE";
          return (
            <Link
              key={m.id}
              href={`/directory/${m.id}`}
              className="rounded-xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">
                    {p?.fullName ?? "—"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    {p?.professionalTitle ?? "—"}
                    {p?.employer ? ` • ${p.employer}` : ""}
                  </div>
                </div>
                <div className="text-xs text-zinc-600">{m.department.name}</div>
              </div>

              <div className="mt-4 grid gap-1 text-xs text-zinc-700">
                <div>
                  <span className="text-zinc-500">Country:</span>{" "}
                  {p?.country ?? "—"}
                </div>
                <div>
                  <span className="text-zinc-500">Email:</span>{" "}
                  {showContact ? m.email : "Hidden"}
                </div>
                <div>
                  <span className="text-zinc-500">Phone:</span>{" "}
                  {showContact ? p?.phone ?? "—" : "Hidden"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

