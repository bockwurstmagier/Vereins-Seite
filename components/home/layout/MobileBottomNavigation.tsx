"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Gauge,
  Home,
  Info,
  LogIn,
  LogOut,
  Menu,
  Newspaper,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from "lucide-react";

import { logout } from "../../../app/login/actions";

type AccountSummary = {
  displayName: string;
  email: string;
  roleLabel: string;
} | null;

type MobileBottomNavigationProps = {
  account: AccountSummary;
};

const mainItems = [
  { label: "Home", href: "/#top", icon: Home },
  { label: "Spiele", href: "/#next-match", icon: CalendarDays },
  { label: "News", href: "/#news", icon: Newspaper },
  { label: "Team", href: "/#team", icon: Users },
] as const;

export default function MobileBottomNavigation({
  account,
}: MobileBottomNavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav
        aria-label="Hauptnavigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/90 px-3 pt-2 backdrop-blur-2xl"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === "/" && item.label === "Home";

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className={`group flex min-h-14 flex-col items-center justify-center rounded-2xl transition duration-200 active:scale-90 ${
                  active
                    ? "bg-red-600 text-white shadow-[0_0_24px_rgba(220,38,38,0.35)]"
                    : "text-zinc-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Mehr öffnen"
            aria-expanded={open}
            className={`group flex min-h-14 flex-col items-center justify-center rounded-2xl transition duration-200 active:scale-90 ${
              open
                ? "bg-red-600 text-white shadow-[0_0_24px_rgba(220,38,38,0.35)]"
                : "text-zinc-500 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Menu size={21} strokeWidth={open ? 2.5 : 2} aria-hidden="true" />
            <span className="mt-1 text-[10px] font-bold uppercase tracking-wide">
              Mehr
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Menü schließen"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="more-menu-title"
            className="absolute inset-x-0 bottom-0 mx-auto max-h-[88svh] max-w-lg overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#0b0b0e] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-24px_80px_rgba(0,0,0,0.7)]"
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/15" />

            <div className="flex items-center justify-between gap-3 px-1">
              <div>
                <p className="club-eyebrow">HUJA App</p>
                <h2 id="more-menu-title" className="mt-1 text-2xl font-black uppercase">
                  Mehr
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400"
                aria-label="Menü schließen"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-gradient-to-br from-club-burgundy/55 to-black p-4">
              {account ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-club-red text-lg font-black text-white shadow-[0_0_25px_rgba(193,18,31,0.35)]">
                    {account.displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-white">
                      {account.displayName}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-club-light-red">
                      {account.roleLabel}
                    </p>
                  </div>
                  <ShieldCheck size={20} className="text-emerald-400" aria-hidden="true" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-club-light-red">
                    <CircleUserRound size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-black text-white">Nicht angemeldet</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Für Vereinsmanager und Live-Steuerung anmelden.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-2">
              {account ? (
                <>
                  <MenuLink href="/konto" icon={CircleUserRound} label="Mein Konto" />
                  <MenuLink href="/admin" icon={Gauge} label="Admin-Dashboard" emphasized />
                  <MenuLink href="/admin/live" icon={Trophy} label="LiveCenter steuern" />
                </>
              ) : (
                <MenuLink href="/login" icon={LogIn} label="Admin anmelden" emphasized />
              )}

              <MenuLink href="/spielplan" icon={CalendarDays} label="Spielplan" />
              <MenuLink href="/tabelle" icon={Trophy} label="Tabelle" />
              <MenuLink href="/termine" icon={CalendarDays} label="Vereinskalender" />
              <MenuLink href="/match-center" icon={Gauge} label="Match-Center" />
              <MenuLink href="/fussball" icon={Info} label="Offizielle Spieldaten" />
            </div>

            {account && (
              <form action={logout} className="mt-4">
                <button
                  type="submit"
                  className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-950/30 px-4 text-sm font-black uppercase tracking-wider text-red-300 transition active:scale-[0.98]"
                >
                  <LogOut size={18} aria-hidden="true" />
                  Abmelden
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  emphasized = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  emphasized?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 transition active:scale-[0.98] ${
        emphasized
          ? "border-club-light-red/25 bg-club-red/15 text-white"
          : "border-white/[0.08] bg-white/[0.035] text-zinc-200"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/30 text-club-light-red">
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="flex-1 text-sm font-black">{label}</span>
      <ChevronRight size={17} className="text-zinc-600" aria-hidden="true" />
    </Link>
  );
}
