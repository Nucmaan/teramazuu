"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login, type LoginState } from "@/app/admin/login/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-10 space-y-6" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="eyebrow text-espresso/70">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          className="block h-12 w-full border-0 border-b border-espresso/25 bg-transparent px-0 text-lg text-espresso placeholder:text-espresso/30 focus:border-green focus:outline-none focus:ring-0"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="eyebrow text-espresso/70">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          className="block h-12 w-full border-0 border-b border-espresso/25 bg-transparent px-0 text-lg text-espresso focus:border-green focus:outline-none focus:ring-0"
        />
      </div>
      {state.error && (
        <p role="alert" className="border-l-2 border-red bg-red/5 px-3 py-2 text-sm text-red-deep">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-14 w-full items-center justify-center gap-3 bg-espresso text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-green disabled:opacity-60"
      >
        {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
