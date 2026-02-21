"use client";

import { useActionState } from "react";

import { registerAction, type RegisterState } from "./actions";

type DepartmentOption = { id: string; name: string };

const initialState: RegisterState = {};

export function RegisterForm({ departments }: { departments: DepartmentOption[] }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Request Membership
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          This platform is for verified graduates of LASU Engineering Class of
          2001. Your account requires email verification and admin approval.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {state.message ? (
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              state.ok
                ? "border-brand-200 bg-brand-50 text-brand-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        {state.devVerificationUrl ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <div className="font-medium">Dev email verification link</div>
            <a className="break-all underline" href={state.devVerificationUrl}>
              {state.devVerificationUrl}
            </a>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Full name</label>
            <input
              name="fullName"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="e.g., Adeola Okonkwo"
              required
            />
            {state.fieldErrors?.fullName ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.fullName}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium">Department</label>
            <select
              name="departmentId"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select department…
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {state.fieldErrors?.departmentId ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.departmentId}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Matric number (optional)
            </label>
            <input
              name="matricNumber"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Optional"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {state.fieldErrors?.email ? (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium">Phone number</label>
            <input
              name="phone"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="+234..."
              required
              autoComplete="tel"
            />
            {state.fieldErrors?.phone ? (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.phone}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium">Country of residence</label>
            <input
              name="country"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="e.g., Nigeria"
              required
              autoComplete="country-name"
            />
            {state.fieldErrors?.country ? (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.country}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium">Professional title</label>
            <input
              name="professionalTitle"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="e.g., Mechanical Engineer"
              required
              autoComplete="organization-title"
            />
            {state.fieldErrors?.professionalTitle ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.professionalTitle}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium">Employer</label>
            <input
              name="employer"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Company / Organization"
              required
              autoComplete="organization"
            />
            {state.fieldErrors?.employer ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.employer}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">
              Profile photo URL (optional)
            </label>
            <input
              name="photoUrl"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="https://..."
            />
            {state.fieldErrors?.photoUrl ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.photoUrl}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900/10"
              required
              autoComplete="new-password"
            />
            {state.fieldErrors?.password ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.password}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-start gap-3 text-sm">
              <input
                name="graduationConfirmed"
                type="checkbox"
                className="mt-1 size-4 rounded border-zinc-300"
              />
              <span>
                I confirm I graduated from LASU Faculty of Engineering, Class of
                2001.
              </span>
            </label>
            {state.fieldErrors?.graduationConfirmed ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.graduationConfirmed}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit membership request"}
        </button>

        <p className="text-sm text-zinc-600">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-zinc-900 underline">
            Sign in
          </a>
          .
        </p>
      </form>
    </div>
  );
}

