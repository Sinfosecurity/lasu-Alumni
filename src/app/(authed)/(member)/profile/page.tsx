import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

import { updateProfileAction } from "./actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true, department: true },
  });
  if (!user) redirect("/login");

  const { saved } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Profile settings
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Update your profile details and contact preference for the alumni
            directory.
          </p>
        </div>
      </div>

      {saved ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Profile saved.
        </div>
      ) : null}

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="grid gap-2 text-sm">
          <div className="font-medium">Account</div>
          <div className="text-zinc-700">
            <span className="text-zinc-500">Email:</span> {user.email}
          </div>
          <div className="text-zinc-700">
            <span className="text-zinc-500">Department:</span> {user.department.name}
          </div>
        </div>
      </div>

      <form
        action={updateProfileAction}
        className="rounded-lg border border-zinc-200 bg-white p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Full name</label>
            <input
              name="fullName"
              defaultValue={user.profile?.fullName ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              name="phone"
              defaultValue={user.profile?.phone ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Country</label>
            <input
              name="country"
              defaultValue={user.profile?.country ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Professional title</label>
            <input
              name="professionalTitle"
              defaultValue={user.profile?.professionalTitle ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Employer</label>
            <input
              name="employer"
              defaultValue={user.profile?.employer ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Photo URL</label>
            <input
              name="photoUrl"
              defaultValue={user.profile?.photoUrl ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="https://..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              name="bio"
              defaultValue={user.profile?.bio ?? ""}
              className="mt-1 min-h-28 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Short professional bio (optional)"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">
              Contact preference
            </label>
            <select
              name="contactPreference"
              defaultValue={user.profile?.contactPreference ?? "MEMBERS_ONLY"}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
            >
              <option value="PUBLIC">Public</option>
              <option value="MEMBERS_ONLY">Members only</option>
              <option value="PRIVATE">Private</option>
            </select>
            <p className="mt-2 text-xs text-zinc-500">
              Directory access is member-only, but this controls whether your
              email/phone is displayed to other members.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

