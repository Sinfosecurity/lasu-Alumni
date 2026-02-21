import Image from "next/image";
import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex rounded-full bg-white p-0.5 shadow-sm ring-1 ring-zinc-200">
              <span className="relative size-10 overflow-hidden rounded-full">
                <Image
                  src="/logo.png"
                  alt="LASU Engineering 2001 Alumni"
                  fill
                  sizes="40px"
                  className="object-cover scale-110"
                  priority
                />
              </span>
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                LASU Engineering Class of 2001
              </div>
              <div className="text-xs text-zinc-600">Global Alumni Platform</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-zinc-700 md:flex">
            <Link className="hover:text-zinc-900" href="/about">
              About
            </Link>
            <Link className="hover:text-zinc-900" href="/contact">
              Contact
            </Link>
            <Link className="hover:text-zinc-900" href="/login">
              Login
            </Link>
            <Link
              className="rounded-md bg-brand-700 px-3 py-2 text-sm font-medium text-white hover:bg-brand-800"
              href="/register"
            >
              Request membership
            </Link>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <Link className="text-sm underline" href="/login">
              Login
            </Link>
            <Link
              className="rounded-md bg-brand-700 px-3 py-2 text-sm font-medium text-white hover:bg-brand-800"
              href="/register"
            >
              Join
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-16 border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="text-sm font-medium">
            “This platform represents the official digital institution of LASU
            Engineering Class of 2001 — connecting engineers globally,
            preserving legacy, and enabling lifelong collaboration.”
          </div>
          <div className="mt-3 text-xs text-zinc-600">
            © {new Date().getFullYear()} LASU Engineering Class of 2001 Global Alumni
            Platform.
          </div>
        </div>
      </footer>
    </div>
  );
}

