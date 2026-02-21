import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto w-full max-w-md px-4 py-12">Loading…</div>}
    >
      <LoginForm />
    </Suspense>
  );
}

