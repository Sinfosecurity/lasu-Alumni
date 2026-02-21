import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const member = await prisma.user.findUnique({
    where: { id },
    include: { profile: true, department: true },
  });

  if (!member || member.status !== "ACTIVE") notFound();

  const p = member.profile;
  const showContact = p?.contactPreference !== "PRIVATE";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {p?.fullName ?? "Member"}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            {p?.professionalTitle ?? "—"}
            {p?.employer ? ` • ${p.employer}` : ""}
          </p>
        </div>
        <Link className="text-sm underline" href="/directory">
          Back to directory
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium">Department</div>
          <div className="mt-1 text-sm text-zinc-700">{member.department.name}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium">Country</div>
          <div className="mt-1 text-sm text-zinc-700">{p?.country ?? "—"}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium">Contact</div>
          <div className="mt-2 grid gap-1 text-sm text-zinc-700">
            <div>
              <span className="text-zinc-500">Email:</span>{" "}
              {showContact ? member.email : "Hidden"}
            </div>
            <div>
              <span className="text-zinc-500">Phone:</span>{" "}
              {showContact ? p?.phone ?? "—" : "Hidden"}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">Bio</div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
          {p?.bio?.trim() ? p.bio : "No bio provided."}
        </p>
      </div>
    </div>
  );
}

