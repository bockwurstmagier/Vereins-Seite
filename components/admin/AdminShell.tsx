"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  House,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  X,
} from "lucide-react";

import { logout } from "../../app/login/actions";
import type { AppRole } from "../../lib/auth/roles";
import AdminNavigation from "./AdminNavigation";
import { HUJA_BRANDING } from "../../lib/branding";

type AdminShellProps = {
  children: React.ReactNode;
  profile: {
    displayName: string;
    email: string;
    role: AppRole;
    roleLabel: string;
  };
  logo: StaticImageData;
};

export default function AdminShell({
  children,
  profile,
  logo,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("admin-sidebar-collapsed");
    setCollapsed(saved === "true");
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-8rem] h-96 w-96 rounded-full bg-club-red/10 blur-[110px]" />
        <div className="absolute bottom-[-12rem] right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-club-burgundy/15 blur-[130px]" />
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden border-r border-white/[0.07] bg-[#0b0b0e]/92 backdrop-blur-3xl transition-[width] duration-300 lg:flex lg:flex-col ${
          collapsed ? "w-[92px]" : "w-[280px]"
        }`}
      >
        <div className="flex h-24 items-center gap-3 border-b border-white/[0.07] px-5">
          <Image
            src={logo}
            alt="SpVgg Middelich-Resse"
            priority
            className="h-auto w-12 shrink-0 object-contain"
          />

          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-club-light-red">
                SpVgg Middelich-Resse
              </p>
              <p className="mt-1 truncate text-sm font-black text-white">
                Vereinsmanager
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]">
          <AdminNavigation
            role={profile.role}
            collapsed={collapsed}
            onNavigate={() => undefined}
          />
        </div>

        <div className="border-t border-white/[0.07] p-3">
          {!collapsed && (
            <div className="mb-3 rounded-3xl border border-white/[0.07] bg-white/[0.035] p-3">
              <p className="truncate text-sm font-black text-white">
                {profile.displayName}
              </p>
              <p className="mt-1 truncate text-[11px] text-zinc-500">
                {profile.roleLabel}
              </p>
            </div>
          )}

          <Link
            href="/"
            title="Zur Startseite"
            className={`mb-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-club-light-red/20 bg-club-red/10 text-xs font-black uppercase tracking-wider text-club-light-red transition hover:border-club-light-red/40 hover:bg-club-red/20 hover:text-white ${collapsed ? "px-0" : "px-4"}`}
          >
            <House size={18} aria-hidden="true" />
            {!collapsed && "Zur App"}
          </Link>

          <div className={`flex gap-2 ${collapsed ? "flex-col" : ""}`}>
            <form action={logout} className="flex-1">
              <button
                type="submit"
                title="Abmelden"
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] text-xs font-black uppercase tracking-wider text-zinc-400 transition hover:border-red-500/25 hover:bg-red-950/25 hover:text-red-300 ${
                  collapsed ? "px-0" : "px-4"
                }`}
              >
                <LogOut size={18} aria-hidden="true" />
                {!collapsed && "Abmelden"}
              </button>
            </form>

            <button
              type="button"
              onClick={toggleCollapsed}
              title={collapsed ? "Sidebar öffnen" : "Sidebar einklappen"}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-500 transition hover:bg-white/[0.08] hover:text-white"
            >
              {collapsed ? (
                <ChevronRight size={18} aria-hidden="true" />
              ) : (
                <ChevronLeft size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Menü schließen"
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(88vw,340px)] flex-col border-r border-white/10 bg-[#0b0b0e] transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/[0.07] px-5">
          <div className="flex items-center gap-3">
            <Image
              src={logo}
              alt="SpVgg Middelich-Resse"
              className="h-auto w-11 object-contain"
            />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-club-light-red">
                SpVgg Middelich-Resse
              </p>
              <p className="mt-1 text-sm font-black">Vereinsmanager</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400"
            aria-label="Menü schließen"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNavigation
            role={profile.role}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>

        <div className="border-t border-white/[0.07] p-4">
          <p className="truncate text-sm font-black">{profile.displayName}</p>
          <p className="mt-1 text-xs text-zinc-500">{profile.roleLabel}</p>
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="club-button-primary mt-4 w-full"
          >
            <House size={17} aria-hidden="true" />
            Zur App
          </Link>
          <form action={logout} className="mt-2">
            <button type="submit" className="club-button-secondary w-full">
              <LogOut size={17} aria-hidden="true" />
              Abmelden
            </button>
          </form>
        </div>
      </aside>

      <div
        className={`relative min-h-screen transition-[padding] duration-300 ${
          collapsed ? "lg:pl-[92px]" : "lg:pl-[280px]"
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#070709]/80 backdrop-blur-2xl">
          <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-400 lg:hidden"
              aria-label="Navigation öffnen"
            >
              <Menu size={20} aria-hidden="true" />
            </button>

            <div className="relative hidden max-w-md flex-1 sm:block">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Bereich oder Inhalt suchen …"
                className="h-11 w-full rounded-2xl border border-white/[0.07] bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-club-light-red/30 focus:bg-white/[0.05]"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/"
                aria-label="Zur Startseite"
                title="Zur Startseite"
                className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-club-light-red/20 bg-club-red/10 px-3 text-xs font-black uppercase tracking-wider text-club-light-red transition hover:border-club-light-red/40 hover:bg-club-red/20 hover:text-white"
              >
                <House size={18} aria-hidden="true" />
                <span className="hidden md:inline">Zur App</span>
              </Link>
              <button
                type="button"
                aria-label="Benachrichtigungen"
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
              >
                <Bell size={18} aria-hidden="true" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-club-light-red shadow-[0_0_10px_rgba(239,51,64,0.9)]" />
              </button>

              <div className="hidden min-w-0 items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-club-red/15 text-xs font-black text-club-light-red">
                  {profile.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="max-w-36 truncate text-xs font-black text-white">
                    {profile.displayName}
                  </p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-600">
                    {profile.roleLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="relative px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </div>
    </main>
  );
}
