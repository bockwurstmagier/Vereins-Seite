"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  FolderOpen,
  Handshake,
  History,
  Home,
  Images,
  Inbox,
  Newspaper,
  Palette,
  Radio,
  Settings,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import { canAccess, type AdminArea } from "../../lib/auth/permissions";
import type { AppRole } from "../../lib/auth/roles";

const items: Array<{
  label: string;
  href: string;
  icon: typeof Home;
  area: AdminArea;
}> = [
  { label: "Dashboard", href: "/admin", icon: Home, area: "dashboard" },
  { label: "Spiele", href: "/admin/spiele", icon: CalendarDays, area: "spiele" },
  { label: "Match-Center", href: "/admin/match-center", icon: Radio, area: "match_center" },
  { label: "News", href: "/admin/news", icon: Newspaper, area: "news" },
  { label: "Galerie", href: "/admin/galerie", icon: Images, area: "galerie" },
  { label: "Team", href: "/admin/team", icon: Users, area: "team" },
  { label: "Sponsoren", href: "/admin/sponsoren", icon: Handshake, area: "sponsoren" },
  { label: "Termine", href: "/admin/termine", icon: CalendarClock, area: "termine" },
  { label: "Anfragen", href: "/admin/anfragen", icon: Inbox, area: "anfragen" },
  { label: "Medien", href: "/admin/medien", icon: FolderOpen, area: "medien" },
  { label: "Text-Assistent", href: "/admin/text-assistent", icon: Sparkles, area: "text_assistent" },
  { label: "Social Studio", href: "/admin/social", icon: Palette, area: "social_studio" },
  { label: "Benutzer", href: "/admin/benutzer", icon: UserCog, area: "benutzer" },
  { label: "Aktivitäten", href: "/admin/aktivitaeten", icon: History, area: "aktivitaeten" },
  { label: "Einstellungen", href: "/admin/einstellungen", icon: Settings, area: "einstellungen" },
];

export default function AdminNavigation({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const visibleItems = items.filter((item) => canAccess(role, item.area));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/90 px-2 pt-2 backdrop-blur-2xl lg:static lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0">
      <div className="mx-auto flex max-w-md gap-1 overflow-x-auto pb-[max(0.65rem,env(safe-area-inset-bottom))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:max-w-none lg:flex-col lg:overflow-visible lg:pb-0">
        {visibleItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-20 flex-col items-center justify-center rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-wide transition lg:min-w-0 lg:flex-row lg:justify-start lg:gap-3 lg:py-3 lg:text-xs ${
                active
                  ? "bg-club-red text-white shadow-[0_0_24px_rgba(193,18,31,0.3)]"
                  : "text-zinc-500 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="mt-1 lg:mt-0">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
