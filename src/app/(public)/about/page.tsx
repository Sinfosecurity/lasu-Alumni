import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          About LASU Engineering 2001
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-700">
          The LASU Faculty of Engineering Class of 2001 is a community of
          engineers across Mechanical Engineering, Electronic &amp; Computer
          Engineering, and Chemical &amp; Polymer Engineering—working around the
          world and united by shared academic and professional roots.
        </p>
        <p className="mt-4 text-base leading-7 text-zinc-700">
          This digital platform serves as our official global headquarters for
          verified members, executive leadership, and department representatives
          to engage, coordinate events, manage communications, and maintain a
          long-term institutional legacy.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-medium">Mission</div>
          <p className="mt-2 text-sm text-zinc-600">
            Connect engineers globally, strengthen professional collaboration,
            and preserve the legacy of the LASU Engineering Class of 2001.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-medium">Governance</div>
          <p className="mt-2 text-sm text-zinc-600">
            Enable executive operations with secure announcements, role-based
            access, and future-ready voting and document sharing.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-medium">Financial stewardship</div>
          <p className="mt-2 text-sm text-zinc-600">
            Support annual dues, event fees, and donations with payment history
            and admin-only reporting.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-2xl bg-zinc-900 px-6 py-10 text-white">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Platform identity statement
            </h2>
            <p className="mt-3 text-sm text-zinc-200">
              “This platform represents the official digital institution of LASU
              Engineering Class of 2001 — connecting engineers globally,
              preserving legacy, and enabling lifelong collaboration.”
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Request membership
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-md border border-white/20 bg-white/10 px-5 text-sm font-medium text-white hover:bg-white/15"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

