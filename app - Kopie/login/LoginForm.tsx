"use client";

import { useActionState } from "react";
import { LockKeyhole, LogIn, Mail } from "lucide-react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
          E-Mail-Adresse
        </span>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4">
          <Mail size={18} className="text-club-light-red" aria-hidden="true" />
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@verein.de"
            className="min-h-14 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
          Passwort
        </span>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4">
          <LockKeyhole
            size={18}
            className="text-club-light-red"
            aria-hidden="true"
          />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="min-h-14 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
          />
        </div>
      </label>

      {state.error && (
        <p className="rounded-2xl border border-red-500/25 bg-red-950/35 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="club-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn size={18} aria-hidden="true" />
        {pending ? "Anmeldung läuft..." : "Anmelden"}
      </button>
    </form>
  );
}
