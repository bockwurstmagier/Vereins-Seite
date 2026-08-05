import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CircleUserRound,
  Gauge,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  Trophy,
} from "lucide-react";

import vereinsLogo from "../logo.png";
import { logout } from "../login/actions";
import { getCurrentProfile, ROLE_LABELS } from "../../lib/auth/roles";

export const metadata = {
  title: "Mein Konto",
};

export default async function AccountPage() {
  const profile = await getCurrentProfile();

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-club-black px-4 pb-12 pt-8 text-white">
      <div className="pointer-events-none absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-club-red/20 blur-3xl" />

      <div className="relative mx-auto max-w-2xl">
        <Link href="/" className="club-eyebrow">
          Zurück zur Startseite
        </Link>

        <section className="club-card mt-6 overflow-hidden">
          <div className="border-b border-white/10 bg-gradient-to-br from-club-burgundy/70 via-club-dark-red/25 to-black p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <Image
                src={vereinsLogo}
                alt="SpVgg Middelich-Resse"
                priority
                className="h-auto w-20 shrink-0 object-contain"
              />
              <div>
                <p className="club-eyebrow">HUJA App</p>
                <h1 className="mt-2 text-3xl font-black uppercase sm:text-4xl">
                  Mein Konto
                </h1>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {profile ? (
              <>
                <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-black/30 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-club-red text-xl font-black shadow-[0_0_28px_rgba(193,18,31,0.35)]">
                    {(profile.display_name || profile.email)
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xl font-black">
                      {profile.display_name || profile.email}
                    </p>
                    <p className="mt-1 text-xs font-black uppercase tracking-wider text-club-light-red">
                      {ROLE_LABELS[profile.role]}
                    </p>
                  </div>

                  <ShieldCheck
                    size={24}
                    className="shrink-0 text-emerald-400"
                    aria-label="Aktives Konto"
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Mail size={18} className="text-club-light-red" aria-hidden="true" />
                    <span className="min-w-0 truncate text-sm">{profile.email}</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <AccountLink href="/admin" icon={Gauge} label="Admin-Dashboard" primary />
                  <AccountLink href="/admin/live" icon={Trophy} label="LiveCenter" />
                  <AccountLink href="/admin/termine" icon={CalendarDays} label="Termine verwalten" />
                  <AccountLink href="/match-center" icon={Trophy} label="Öffentliches Match-Center" />
                </div>

                <form action={logout} className="mt-6">
                  <button
                    type="submit"
                    className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-950/30 px-5 text-sm font-black uppercase tracking-wider text-red-300 transition active:scale-[0.98]"
                  >
                    <LogOut size={18} aria-hidden="true" />
                    Abmelden
                  </button>
                </form>
              </>
            ) : (
              <div className="py-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-black/35 text-club-light-red">
                  <CircleUserRound size={38} aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-2xl font-black uppercase">
                  Nicht angemeldet
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
                  Melde dich an, um den Vereinsmanager, das LiveCenter und deine
                  freigegebenen Verwaltungsbereiche zu öffnen.
                </p>
                <Link href="/login" className="club-button-primary mt-7 w-full">
                  <LogIn size={18} aria-hidden="true" />
                  Admin anmelden
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AccountLink({
  href,
  icon: Icon,
  label,
  primary = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-16 items-center gap-3 rounded-2xl border px-4 text-sm font-black transition active:scale-[0.98] ${
        primary
          ? "border-club-light-red/25 bg-club-red/15 text-white"
          : "border-white/[0.08] bg-white/[0.035] text-zinc-200"
      }`}
    >
      <Icon size={19} className="text-club-light-red" aria-hidden="true" />
      {label}
    </Link>
  );
}
