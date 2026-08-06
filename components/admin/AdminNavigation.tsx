"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  CalendarClock,
  CalendarDays,
  FileSpreadsheet,
  FolderOpen,
  Handshake,
  History,
  Home,
  Images,
  Inbox,
  Newspaper,
  PackageCheck,
  Palette,
  Radio,
  Settings,
  Shield,
  Smartphone,
  ClipboardList,
  Sparkles,
  Table2,
  UserCog,
  Users,
} from "lucide-react";

import { canAccess, type AdminArea } from "../../lib/auth/permissions";
import type { AppRole } from "../../lib/auth/roles";

const sections: Array<{
  title: string;
  items: Array<{
    label: string;
    href: string;
    icon: typeof Home;
    area: AdminArea;
  }>;
}> = [
  {
    title: "Übersicht",
    items: [{ label: "Dashboard", href: "/admin", icon: Home, area: "dashboard" }],
  },
  {
    title: "Sport",
    items: [
      { label: "Spiele", href: "/admin/spiele", icon: CalendarDays, area: "spiele" },
      { label: "Saisonimport", href: "/admin/saisonimport", icon: FileSpreadsheet, area: "saisonimport" },
      { label: "Match-Center", href: "/admin/match-center", icon: Radio, area: "match_center" },
      { label: "Live-Steuerung", href: "/admin/live", icon: Smartphone, area: "live_admin" },
      { label: "Trainercockpit", href: "/admin/trainer", icon: ClipboardList, area: "trainer_cockpit" },
      { label: "Statistiken", href: "/admin/statistiken", icon: BarChart3, area: "statistiken" },
      { label: "Tabelle", href: "/admin/tabelle", icon: Table2, area: "tabelle" },
      { label: "Team", href: "/admin/team", icon: Users, area: "team" },
      { label: "Termine", href: "/admin/termine", icon: CalendarClock, area: "termine" },
    ],
  },
  {
    title: "Medien",
    items: [
      { label: "News", href: "/admin/news", icon: Newspaper, area: "news" },
      { label: "Galerie", href: "/admin/galerie", icon: Images, area: "galerie" },
      { label: "Medien", href: "/admin/medien", icon: FolderOpen, area: "medien" },
      { label: "Social Studio", href: "/admin/social", icon: Palette, area: "social_studio" },
      { label: "Text-Assistent", href: "/admin/text-assistent", icon: Sparkles, area: "text_assistent" },
      { label: "Vereinsassistent", href: "/admin/vereinsassistent", icon: Bot, area: "vereinsassistent" },
    ],
  },
  {
    title: "Verein",
    items: [
      { label: "Sponsoren", href: "/admin/sponsoren", icon: Handshake, area: "sponsoren" },
      { label: "Vereine & Logos", href: "/admin/vereine", icon: Shield, area: "vereine" },
      { label: "Anfragen", href: "/admin/anfragen", icon: Inbox, area: "anfragen" },
      { label: "Benutzer", href: "/admin/benutzer", icon: UserCog, area: "benutzer" },
      { label: "Aktivitäten", href: "/admin/aktivitaeten", icon: History, area: "aktivitaeten" },
      { label: "Einstellungen", href: "/admin/einstellungen", icon: Settings, area: "einstellungen" },
    ],
  },
];

type AdminNavigationProps = {
  role: AppRole;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export default function AdminNavigation({
  role,
  collapsed = false,
  onNavigate,
}: AdminNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-5">
      {sections.map((section) => {
        const items = section.items.filter((item) => canAccess(role, item.area));

        if (!items.length) return null;

        return (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-700">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex h-12 items-center rounded-2xl text-sm font-bold transition ${
                      collapsed ? "justify-center px-0" : "gap-3 px-3"
                    } ${
                      active
                        ? "bg-gradient-to-r from-club-red/85 to-club-dark-red/70 text-white shadow-[0_12px_35px_rgba(193,18,31,0.22)]"
                        : "text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-100"
                    }`}
                  >
                    <Icon
                      size={19}
                      className={active ? "text-white" : "text-zinc-600 transition group-hover:text-club-light-red"}
                      aria-hidden="true"
                    />
                    {!collapsed && <span>{item.label}</span>}
                    {active && !collapsed && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/90" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
