import Image from "next/image";
import { LogOut } from "lucide-react";
import vereinsLogo from "../logo.png";
import AdminNavigation from "../../components/admin/AdminNavigation";
import { ROLE_LABELS, requireActiveProfile } from "../../lib/auth/roles";
import { logout } from "../login/actions";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireActiveProfile();

  return (
    <main className="min-h-screen bg-club-black pb-24 text-white lg:grid lg:grid-cols-[260px_1fr] lg:pb-0">
      <aside className="hidden min-h-screen border-r border-white/10 bg-club-surface/70 p-5 backdrop-blur-xl lg:block">
        <div className="flex items-center gap-3">
          <Image
            src={vereinsLogo}
            alt="SpVgg Middelich-Resse"
            className="h-auto w-14 object-contain"
          />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-club-light-red">
              SpVgg
            </p>
            <p className="text-sm font-black">Vereinsmanager</p>
          </div>
        </div>

        <div className="mt-8">
          <AdminNavigation role={profile.role} />
        </div>

        <form action={logout} className="mt-8">
          <button type="submit" className="club-button-secondary w-full">
            <LogOut size={17} aria-hidden="true" />
            Abmelden
          </button>
        </form>
      </aside>

      <section className="min-w-0">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur-2xl lg:px-8">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-club-light-red">
              {ROLE_LABELS[profile.role]}
            </p>
            <p className="mt-1 max-w-[220px] truncate text-sm text-zinc-400">
              {profile.display_name || profile.email}
            </p>
          </div>

          <form action={logout} className="lg:hidden">
            <button
              type="submit"
              aria-label="Abmelden"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-zinc-300"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </form>
        </header>

        <div className="px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </section>

      <div className="lg:hidden">
        <AdminNavigation role={profile.role} />
      </div>
    </main>
  );
}
