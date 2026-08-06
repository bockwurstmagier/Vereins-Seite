"use client";

import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Clock3,
  Droplets,
  Eye,
  EyeOff,
  GripVertical,
  Handshake,
  Images,
  LayoutDashboard,
  Newspaper,
  Palette,
  Plus,
  Radio,
  RotateCcw,
  Settings2,
  Sparkles,
  Sun,
  Timer,
  Trophy,
  Umbrella,
  Users,
  Wind,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { AdminArea } from "../../lib/auth/permissions";
import type { AppRole } from "../../lib/auth/roles";

type NextMatch = {
  id: string;
  competition: string;
  home_team: string;
  away_team: string;
  match_date: string;
  location: string | null;
} | null;

type NewsRow = {
  id: string;
  title: string;
  category: string;
  status: string;
};

type EventRow = {
  id: string;
  title: string;
  event_type: string;
  starts_at: string;
  location: string | null;
  is_public: boolean;
};

type ActivityRow = {
  id: number;
  action: "insert" | "update" | "delete";
  entity_type: string;
  title: string | null;
  created_at: string;
};

type DashboardData = {
  displayName: string;
  role: AppRole;
  roleLabel: string;
  counts: {
    matches: number;
    players: number;
    news: number;
    sponsors: number;
    gallery: number;
  };
  season: {
    games: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    winRate: number;
  };
  nextMatch: NextMatch;
  recentNews: NewsRow[];
  upcomingEvents: EventRow[];
  activities: ActivityRow[];
  accessibleAreas: AdminArea[];
};

type WidgetId =
  | "smart_countdown"
  | "weather"
  | "stats"
  | "next_match"
  | "season"
  | "events"
  | "news"
  | "activities"
  | "media";

type DashboardPreferences = {
  order: WidgetId[];
  hidden: WidgetId[];
};

const ALL_WIDGETS: WidgetId[] = [
  "smart_countdown",
  "weather",
  "stats",
  "next_match",
  "season",
  "events",
  "news",
  "activities",
  "media",
];

const ROLE_DEFAULTS: Record<AppRole, DashboardPreferences> = {
  administrator: {
    order: ["smart_countdown", "weather", "stats", "next_match", "season", "events", "activities", "news", "media"],
    hidden: [],
  },
  vorstand: {
    order: ["smart_countdown", "weather", "stats", "next_match", "events", "season", "activities", "news", "media"],
    hidden: [],
  },
  trainer: {
    order: ["smart_countdown", "weather", "next_match", "season", "events", "stats", "activities", "news", "media"],
    hidden: ["news", "media"],
  },
  social_media: {
    order: ["smart_countdown", "weather", "news", "media", "next_match", "stats", "events", "activities", "season"],
    hidden: ["season"],
  },
  betreuer: {
    order: ["smart_countdown", "weather", "next_match", "events", "season", "stats", "activities", "news", "media"],
    hidden: ["media"],
  },
  spieler: {
    order: ALL_WIDGETS,
    hidden: ALL_WIDGETS,
  },
};

const WIDGET_LABELS: Record<WidgetId, string> = {
  smart_countdown: "Smart Countdown",
  weather: "Wetter am Vereinsgelände",
  stats: "Kennzahlen",
  next_match: "Nächstes Spiel",
  season: "Leistungsübersicht",
  events: "Nächste Termine",
  news: "Neueste Beiträge",
  activities: "Letzte Aktivitäten",
  media: "Medien-Schnellstart",
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const shortDateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Berlin",
});

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default function PersonalDashboard({ data }: { data: DashboardData }) {
  const storageKey = `huja-dashboard-v16-${data.role}`;
  const [preferences, setPreferences] = useState<DashboardPreferences>(
    ROLE_DEFAULTS[data.role],
  );
  const [editing, setEditing] = useState(false);
  const [dragged, setDragged] = useState<WidgetId | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<DashboardPreferences>;
      const order = Array.isArray(parsed.order)
        ? [
            ...parsed.order.filter((id): id is WidgetId =>
              ALL_WIDGETS.includes(id as WidgetId),
            ),
            ...ALL_WIDGETS.filter((id) => !parsed.order?.includes(id)),
          ]
        : ROLE_DEFAULTS[data.role].order;
      const hidden = Array.isArray(parsed.hidden)
        ? parsed.hidden.filter((id): id is WidgetId =>
            ALL_WIDGETS.includes(id as WidgetId),
          )
        : ROLE_DEFAULTS[data.role].hidden;

      setPreferences({ order, hidden });
    } catch {
      setPreferences(ROLE_DEFAULTS[data.role]);
    }
  }, [data.role, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences, storageKey]);

  const visibleWidgets = useMemo(
    () => preferences.order.filter((id) => !preferences.hidden.includes(id)),
    [preferences],
  );

  function moveWidget(id: WidgetId, direction: -1 | 1) {
    setPreferences((current) => {
      const index = current.order.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.order.length) return current;
      const order = [...current.order];
      [order[index], order[target]] = [order[target], order[index]];
      return { ...current, order };
    });
  }

  function dropWidget(target: WidgetId) {
    if (!dragged || dragged === target) return;
    setPreferences((current) => {
      const order = current.order.filter((id) => id !== dragged);
      const targetIndex = order.indexOf(target);
      order.splice(targetIndex, 0, dragged);
      return { ...current, order };
    });
    setDragged(null);
  }

  function toggleWidget(id: WidgetId) {
    setPreferences((current) => ({
      ...current,
      hidden: current.hidden.includes(id)
        ? current.hidden.filter((entry) => entry !== id)
        : [...current.hidden, id],
    }));
  }

  function resetDashboard() {
    setPreferences(ROLE_DEFAULTS[data.role]);
  }

  const quickActions = getQuickActions(data.role).filter((action) =>
    data.accessibleAreas.includes(action.area),
  );

  return (
    <div className="mx-auto max-w-[1500px]">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-club-red/[0.09] p-6 shadow-[0_35px_100px_rgba(0,0,0,0.4)] sm:p-8">
        <div className="pointer-events-none absolute right-[-7rem] top-[-8rem] h-72 w-72 rounded-full bg-club-red/20 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-[-7rem] left-[25%] h-48 w-48 rounded-full bg-club-burgundy/25 blur-[80px]" />

        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-club-light-red/20 bg-club-red/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-club-light-red">
                Vereins-App 2.0
              </span>
              <span className="rounded-full border border-emerald-500/15 bg-emerald-950/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
                Persönlich für {data.roleLabel}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
              {getGreeting()}, {data.displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Deine persönliche Vereinszentrale zeigt zuerst die Bereiche, die
              für deine Rolle am wichtigsten sind.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditing((current) => !current)}
              className={editing ? "club-button-primary" : "club-button-secondary"}
            >
              <Settings2 size={16} />
              {editing ? "Anordnung speichern" : "Dashboard anpassen"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetDashboard}
                className="club-button-secondary"
              >
                <RotateCcw size={16} />
                Rolle zurücksetzen
              </button>
            )}
          </div>
        </div>

        <div className="relative mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex min-h-20 items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-club-light-red/25 hover:bg-white/[0.06]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-club-red/12 text-club-light-red">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-white">
                    {action.label}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-zinc-600">
                    {action.hint}
                  </p>
                </div>
                <ArrowUpRight
                  size={15}
                  className="ml-auto text-zinc-700 transition group-hover:text-club-light-red"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {editing && (
        <section className="mt-5 rounded-[2rem] border border-club-light-red/20 bg-club-red/[0.06] p-5">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={19} className="text-club-light-red" />
            <div>
              <p className="text-sm font-black uppercase text-white">
                Widgets verwalten
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Ziehen, mit den Pfeilen verschieben oder einzelne Widgets ausblenden.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {preferences.order.map((id, index) => {
              const hidden = preferences.hidden.includes(id);
              return (
                <div
                  key={id}
                  draggable
                  onDragStart={() => setDragged(id)}
                  onDragEnd={() => setDragged(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropWidget(id)}
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-3 ${
                    dragged === id
                      ? "border-club-light-red/40 bg-club-red/15 opacity-60"
                      : "border-white/10 bg-black/25"
                  }`}
                >
                  <GripVertical size={16} className="cursor-grab text-zinc-600" />
                  <p className="min-w-0 flex-1 truncate text-xs font-black text-white">
                    {WIDGET_LABELS[id]}
                  </p>
                  <button
                    type="button"
                    onClick={() => moveWidget(id, -1)}
                    disabled={index === 0}
                    className="text-zinc-500 disabled:opacity-20"
                    aria-label="Widget nach oben"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveWidget(id, 1)}
                    disabled={index === preferences.order.length - 1}
                    className="text-zinc-500 disabled:opacity-20"
                    aria-label="Widget nach unten"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWidget(id)}
                    className={hidden ? "text-zinc-600" : "text-club-light-red"}
                    aria-label={hidden ? "Widget einblenden" : "Widget ausblenden"}
                  >
                    {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-5 space-y-5">
        {visibleWidgets.map((id) => (
          <DashboardWidget
            key={id}
            id={id}
            data={data}
            editing={editing}
            onHide={() => toggleWidget(id)}
            onDragStart={() => setDragged(id)}
            onDrop={() => dropWidget(id)}
          />
        ))}
      </div>
    </div>
  );
}

function DashboardWidget({
  id,
  data,
  editing,
  onHide,
  onDragStart,
  onDrop,
}: {
  id: WidgetId;
  data: DashboardData;
  editing: boolean;
  onHide: () => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const wrapper = (children: React.ReactNode, className = "") => (
    <div
      draggable={editing}
      onDragStart={onDragStart}
      onDragOver={(event) => editing && event.preventDefault()}
      onDrop={() => editing && onDrop()}
      className={`relative ${editing ? "cursor-grab rounded-[2.1rem] ring-1 ring-club-light-red/20" : ""} ${className}`}
    >
      {editing && (
        <div className="absolute right-3 top-3 z-20 flex gap-2">
          <div className="flex h-9 items-center gap-1 rounded-xl border border-white/10 bg-black/80 px-2 text-zinc-500">
            <GripVertical size={15} />
            <span className="hidden text-[9px] font-black uppercase sm:inline">
              Ziehen
            </span>
          </div>
          <button
            type="button"
            onClick={onHide}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/80 text-zinc-400 hover:text-red-300"
            aria-label="Widget ausblenden"
          >
            <X size={15} />
          </button>
        </div>
      )}
      {children}
    </div>
  );

  if (id === "smart_countdown") {
    const nextItem = getNextDashboardItem(data.nextMatch, data.upcomingEvents);

    return wrapper(
      <SmartCountdownWidget nextItem={nextItem} />,
    );
  }

  if (id === "weather") {
    return wrapper(<WeatherWidget nextMatch={data.nextMatch} />);
  }

  if (id === "stats") {
    const cards = [
      ["Spiele", data.counts.matches, CalendarDays, "/admin/spiele"],
      ["Aktive Spieler", data.counts.players, Users, "/admin/team"],
      ["News", data.counts.news, Newspaper, "/admin/news"],
      ["Sponsoren", data.counts.sponsors, Handshake, "/admin/sponsoren"],
      ["Galerie", data.counts.gallery, Images, "/admin/galerie"],
    ] as const;

    return wrapper(
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, Icon, href]) => (
          <Link
            key={label}
            href={href}
            className="group rounded-[1.75rem] border border-white/[0.07] bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-club-light-red/20 hover:bg-white/[0.055]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-club-red/10 text-club-light-red">
                <Icon size={19} />
              </div>
              <ArrowUpRight
                size={16}
                className="text-zinc-700 transition group-hover:text-club-light-red"
              />
            </div>
            <p className="mt-6 text-3xl font-black tabular-nums text-white">
              {value}
            </p>
            <p className="mt-1 text-xs font-black uppercase tracking-wider text-zinc-400">
              {label}
            </p>
          </Link>
        ))}
      </section>,
    );
  }

  if (id === "next_match") {
    return wrapper(
      <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
        <PanelHeader
          icon={<Trophy size={18} />}
          eyebrow="Spielbetrieb"
          title="Nächstes Spiel"
          href="/admin/spiele"
        />
        {data.nextMatch ? (
          <div className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-club-burgundy/40 via-black/40 to-black/65 p-5 sm:p-7">
            <div className="absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full bg-club-red/20 blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-club-light-red/20 bg-club-red/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-club-light-red">
                  {data.nextMatch.competition}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                  {dateFormatter.format(new Date(data.nextMatch.match_date))}
                </span>
              </div>
              <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                <p className="text-lg font-black leading-tight text-white sm:text-2xl">
                  {data.nextMatch.home_team}
                </p>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-club-light-red/20 bg-black/35 text-sm font-black italic text-club-light-red">
                  VS
                </div>
                <p className="text-lg font-black leading-tight text-white sm:text-2xl">
                  {data.nextMatch.away_team}
                </p>
              </div>
              <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2">
                  <Clock3 size={14} className="text-club-light-red" />
                  {timeFormatter.format(new Date(data.nextMatch.match_date))} Uhr
                </span>
                {data.nextMatch.location && (
                  <span className="rounded-xl bg-black/25 px-3 py-2">
                    {data.nextMatch.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState text="Aktuell ist kein kommendes Spiel eingetragen." />
        )}
      </section>,
    );
  }

  if (id === "season") {
    return wrapper(
      <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
        <PanelHeader
          icon={<BarChart3 size={18} />}
          eyebrow="Saison"
          title="Leistungsübersicht"
          href="/admin/statistiken"
        />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SeasonMetric label="Spiele" value={data.season.games} />
          <SeasonMetric label="Siege" value={data.season.wins} accent />
          <SeasonMetric label="Remis" value={data.season.draws} />
          <SeasonMetric label="Niederlagen" value={data.season.losses} />
        </div>
        <div className="mt-4 rounded-3xl border border-white/[0.07] bg-black/20 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-500">Siegquote</span>
            <span className="font-black text-white">
              {data.season.winRate}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-club-red to-club-light-red shadow-[0_0_14px_rgba(239,51,64,0.55)]"
              style={{ width: `${data.season.winRate}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-zinc-600">Tore</p>
              <p className="mt-1 text-lg font-black text-white">
                {data.season.goalsFor}
              </p>
            </div>
            <div>
              <p className="text-zinc-600">Gegentore</p>
              <p className="mt-1 text-lg font-black text-white">
                {data.season.goalsAgainst}
              </p>
            </div>
          </div>
        </div>
      </section>,
    );
  }

  if (id === "events") {
    return wrapper(
      <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
        <PanelHeader
          icon={<CalendarClock size={18} />}
          eyebrow="Organisation"
          title="Nächste Termine"
          href="/admin/termine"
        />
        {!data.upcomingEvents.length ? (
          <EmptyState text="Keine kommenden Termine vorhanden." />
        ) : (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {data.upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/admin/termine/${event.id}`}
                className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/20 p-3 transition hover:border-club-light-red/15 hover:bg-white/[0.035]"
              >
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-club-red/10 text-club-light-red">
                  <span className="text-[9px] font-black uppercase">
                    {shortDateFormatter
                      .format(new Date(event.starts_at))
                      .slice(3)}
                  </span>
                  <span className="text-sm font-black">
                    {new Date(event.starts_at).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      timeZone: "Europe/Berlin",
                    })}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">
                    {event.title}
                  </p>
                  <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    {event.event_type} ·{" "}
                    {timeFormatter.format(new Date(event.starts_at))} Uhr
                  </p>
                </div>
                {!event.is_public && (
                  <CircleDot
                    size={14}
                    className="text-amber-400"
                    aria-label="Interner Termin"
                  />
                )}
              </Link>
            ))}
          </div>
        )}
      </section>,
    );
  }

  if (id === "news") {
    return wrapper(
      <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
        <PanelHeader
          icon={<Newspaper size={18} />}
          eyebrow="Redaktion"
          title="Neueste Beiträge"
          href="/admin/news"
        />
        {!data.recentNews.length ? (
          <EmptyState text="Noch keine News vorhanden." />
        ) : (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {data.recentNews.map((item) => (
              <Link
                key={item.id}
                href={`/admin/news/${item.id}`}
                className="block rounded-2xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-club-light-red/15 hover:bg-white/[0.035]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-club-light-red">
                      {item.category}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-black leading-5 text-white">
                      {item.title}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wider ${
                      item.status === "published"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {item.status === "published" ? "Live" : "Entwurf"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>,
    );
  }

  if (id === "activities") {
    return wrapper(
      <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
        <PanelHeader
          icon={<CheckCircle2 size={18} />}
          eyebrow="Protokoll"
          title="Letzte Aktivitäten"
          href="/admin/aktivitaeten"
        />
        {!data.activities.length ? (
          <EmptyState text="Noch keine Aktivitäten protokolliert." />
        ) : (
          <div className="mt-5 grid gap-x-6 lg:grid-cols-2">
            {data.activities.map((activity) => {
              const config = getActivityConfig(activity.action);
              return (
                <div
                  key={activity.id}
                  className="flex gap-3 border-b border-white/[0.055] py-3 last:border-0"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${config.dot}`}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-200">
                      {activity.title || "Änderung im System"}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                      {config.label} · {activity.entity_type} ·{" "}
                      {timeFormatter.format(new Date(activity.created_at))} Uhr
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>,
    );
  }

  return wrapper(
    <section className="rounded-[2rem] border border-white/[0.07] bg-gradient-to-r from-club-burgundy/20 via-white/[0.035] to-transparent p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-club-red/15 text-club-light-red">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-white">
              Medienproduktion starten
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Texte, Social-Grafiken oder komplette Spieltagspakete erzeugen.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.accessibleAreas.includes("text_assistent") && (
            <Link href="/admin/text-assistent" className="club-button-secondary">
              Text-Assistent
            </Link>
          )}
          {data.accessibleAreas.includes("social_studio") && (
            <Link href="/admin/social" className="club-button-secondary">
              Social Studio
            </Link>
          )}
          {data.accessibleAreas.includes("grafikstudio") && (
            <Link href="/admin/grafikstudio" className="club-button-primary">
              Grafikstudio
            </Link>
          )}
        </div>
      </div>
    </section>,
  );
}


type WeatherPayload = {
  location: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    sunrise: string[];
    sunset: string[];
  };
};

type CountdownItem = {
  type: "match" | "event";
  title: string;
  subtitle: string;
  date: string;
  href: string;
} | null;

function getNextDashboardItem(
  match: NextMatch,
  events: EventRow[],
): CountdownItem {
  const candidates: Array<CountdownItem & { timestamp: number }> = [];

  if (match) {
    candidates.push({
      type: "match",
      title: `${match.home_team} – ${match.away_team}`,
      subtitle: match.competition,
      date: match.match_date,
      href: `/admin/live/${match.id}`,
      timestamp: new Date(match.match_date).getTime(),
    });
  }

  for (const event of events) {
    candidates.push({
      type: "event",
      title: event.title,
      subtitle: event.event_type,
      date: event.starts_at,
      href: `/admin/termine/${event.id}`,
      timestamp: new Date(event.starts_at).getTime(),
    });
  }

  return (
    candidates
      .filter((entry) => entry.timestamp >= Date.now())
      .sort((a, b) => a.timestamp - b.timestamp)[0] ?? null
  );
}

function SmartCountdownWidget({ nextItem }: { nextItem: CountdownItem }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!nextItem) {
    return (
      <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
        <PanelHeader
          icon={<Timer size={18} />}
          eyebrow="Smart Countdown"
          title="Nächster wichtiger Termin"
        />
        <EmptyState text="Aktuell steht kein kommender Termin an." />
      </section>
    );
  }

  const target = new Date(nextItem.date).getTime();
  const difference = Math.max(0, target - now);
  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference % 86_400_000) / 3_600_000);
  const minutes = Math.floor((difference % 3_600_000) / 60_000);
  const seconds = Math.floor((difference % 60_000) / 1000);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-club-light-red/15 bg-gradient-to-br from-club-burgundy/45 via-black/55 to-black/75 p-5 sm:p-6">
      <div className="pointer-events-none absolute right-[-4rem] top-[-5rem] h-48 w-48 rounded-full bg-club-red/20 blur-[70px]" />
      <div className="relative">
        <PanelHeader
          icon={<Timer size={18} />}
          eyebrow="Smart Countdown"
          title={nextItem.type === "match" ? "Bis zum nächsten Spiel" : "Bis zum nächsten Termin"}
          href={nextItem.href}
        />

        <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
          {[
            [days, "Tage"],
            [hours, "Std."],
            [minutes, "Min."],
            [seconds, "Sek."],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/[0.08] bg-black/30 px-2 py-4 text-center backdrop-blur"
            >
              <p className="text-2xl font-black tabular-nums text-white sm:text-4xl">
                {String(value).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-zinc-600 sm:text-[9px]">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
          <p className="truncate text-sm font-black text-white">
            {nextItem.title}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-club-light-red">
            {nextItem.subtitle} · {dateFormatter.format(new Date(nextItem.date))} ·{" "}
            {timeFormatter.format(new Date(nextItem.date))} Uhr
          </p>
        </div>
      </div>
    </section>
  );
}

function WeatherWidget({ nextMatch }: { nextMatch: NextMatch }) {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/dashboard/weather", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Weather request failed");
        return (await response.json()) as WeatherPayload;
      })
      .then((payload) => setWeather(payload))
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
      });

    return () => controller.abort();
  }, []);

  if (failed) {
    return (
      <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
        <PanelHeader
          icon={<Cloud size={18} />}
          eyebrow="Spieltag-Wetter"
          title="Gelsenkirchen"
        />
        <EmptyState text="Das Wetter konnte gerade nicht geladen werden." />
      </section>
    );
  }

  if (!weather) {
    return (
      <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
        <PanelHeader
          icon={<Cloud size={18} />}
          eyebrow="Spieltag-Wetter"
          title="Wetter wird geladen"
        />
        <div className="mt-5 h-36 animate-pulse rounded-3xl bg-white/[0.035]" />
      </section>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.current.weather_code);
  const condition = getWeatherLabel(weather.current.weather_code);
  const todayRain = weather.daily.precipitation_probability_max[0] ?? 0;
  const matchDayIndex = nextMatch
    ? weather.daily.time.findIndex(
        (day) => day === nextMatch.match_date.slice(0, 10),
      )
    : -1;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-gradient-to-br from-sky-950/35 via-white/[0.035] to-club-red/[0.06] p-5 sm:p-6">
      <div className="pointer-events-none absolute right-[-3rem] top-[-4rem] h-44 w-44 rounded-full bg-sky-400/10 blur-[65px]" />
      <div className="relative">
        <PanelHeader
          icon={<WeatherIcon size={18} />}
          eyebrow="Spieltag-Wetter"
          title={weather.location}
        />

        <div className="mt-5 flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/[0.08] bg-black/20 text-sky-200">
            <WeatherIcon size={40} />
          </div>
          <div>
            <p className="text-4xl font-black tabular-nums text-white">
              {Math.round(weather.current.temperature_2m)}°
            </p>
            <p className="mt-1 text-sm font-black text-zinc-300">{condition}</p>
            <p className="mt-1 text-xs text-zinc-600">
              Gefühlt {Math.round(weather.current.apparent_temperature)}°
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <WeatherMetric
            icon={<Droplets size={15} />}
            label="Luftfeuchte"
            value={`${weather.current.relative_humidity_2m}%`}
          />
          <WeatherMetric
            icon={<Wind size={15} />}
            label="Wind"
            value={`${Math.round(weather.current.wind_speed_10m)} km/h`}
          />
          <WeatherMetric
            icon={<Umbrella size={15} />}
            label="Regenrisiko"
            value={`${todayRain}%`}
          />
        </div>

        {nextMatch && matchDayIndex >= 0 && (
          <div className="mt-4 rounded-2xl border border-club-light-red/12 bg-club-red/[0.07] p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-club-light-red">
              Prognose für den Spieltag
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-300">
              {Math.round(weather.daily.temperature_2m_min[matchDayIndex])}° bis{" "}
              {Math.round(weather.daily.temperature_2m_max[matchDayIndex])}° ·{" "}
              {weather.daily.precipitation_probability_max[matchDayIndex]}% Regenrisiko · Wind bis{" "}
              {Math.round(weather.daily.wind_speed_10m_max[matchDayIndex])} km/h
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function WeatherMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-3">
      <div className="text-sky-200">{icon}</div>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
      <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-zinc-600">
        {label}
      </p>
    </div>
  );
}

function getWeatherIcon(code: number) {
  if (code === 0) return Sun;
  if ([1, 2, 3].includes(code)) return Cloud;
  if ([45, 48].includes(code)) return CloudFog;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return CloudRain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow;
  if ([95, 96, 99].includes(code)) return CloudLightning;
  return Cloud;
}

function getWeatherLabel(code: number) {
  if (code === 0) return "Klar";
  if (code === 1) return "Überwiegend klar";
  if (code === 2) return "Teilweise bewölkt";
  if (code === 3) return "Bewölkt";
  if ([45, 48].includes(code)) return "Neblig";
  if ([51, 53, 55, 56, 57].includes(code)) return "Nieselregen";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Regen";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Schnee";
  if ([95, 96, 99].includes(code)) return "Gewitter";
  return "Wetterlage";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Guten Morgen";
  if (hour < 17) return "Hallo";
  return "Guten Abend";
}

function getQuickActions(role: AppRole) {
  const common = [
    {
      label: "Nächstes Spiel",
      hint: "Spielbetrieb öffnen",
      href: "/admin/spiele",
      icon: CalendarDays,
      area: "spiele" as AdminArea,
    },
  ];

  const roleActions: Record<AppRole, typeof common> = {
    administrator: [
      {
        label: "Neues Spiel",
        hint: "Begegnung anlegen",
        href: "/admin/spiele#new-match",
        icon: Plus,
        area: "spiele",
      },
      {
        label: "News schreiben",
        hint: "Beitrag veröffentlichen",
        href: "/admin/news#new-news",
        icon: Newspaper,
        area: "news",
      },
      {
        label: "Spieler einladen",
        hint: "WhatsApp-Link erstellen",
        href: "/admin/spielerportal/einladungen",
        icon: Users,
        area: "spielerportal",
      },
      {
        label: "Grafikpaket",
        hint: "Social-Media-Paket",
        href: "/admin/grafikstudio",
        icon: Palette,
        area: "grafikstudio",
      },
    ],
    vorstand: [
      {
        label: "Saisonimport",
        hint: "DFBnet aktualisieren",
        href: "/admin/saisonimport",
        icon: CalendarDays,
        area: "saisonimport",
      },
      {
        label: "Termin anlegen",
        hint: "Vereinstermin planen",
        href: "/admin/termine",
        icon: CalendarClock,
        area: "termine",
      },
      {
        label: "Spieler einladen",
        hint: "WhatsApp-Link erstellen",
        href: "/admin/spielerportal/einladungen",
        icon: Users,
        area: "spielerportal",
      },
      {
        label: "Aktivitäten",
        hint: "Änderungen prüfen",
        href: "/admin/aktivitaeten",
        icon: Activity,
        area: "aktivitaeten",
      },
    ],
    trainer: [
      {
        label: "Trainercockpit",
        hint: "Kader und Training",
        href: "/admin/trainer",
        icon: Trophy,
        area: "trainer_cockpit",
      },
      {
        label: "LiveCenter",
        hint: "Spiel starten",
        href: "/admin/live",
        icon: Radio,
        area: "live_admin",
      },
      {
        label: "Termin anlegen",
        hint: "Training oder Spiel",
        href: "/admin/termine",
        icon: CalendarClock,
        area: "termine",
      },
      {
        label: "Spielerportal",
        hint: "Rückmeldungen prüfen",
        href: "/admin/spielerportal",
        icon: Users,
        area: "spielerportal",
      },
    ],
    social_media: [
      {
        label: "News schreiben",
        hint: "Beitrag veröffentlichen",
        href: "/admin/news#new-news",
        icon: Newspaper,
        area: "news",
      },
      {
        label: "Social Studio",
        hint: "Einzelgrafik erstellen",
        href: "/admin/social",
        icon: Palette,
        area: "social_studio",
      },
      {
        label: "Grafikpaket",
        hint: "7 Grafiken erstellen",
        href: "/admin/grafikstudio",
        icon: Sparkles,
        area: "grafikstudio",
      },
      {
        label: "Galerie",
        hint: "Bilder verwalten",
        href: "/admin/galerie",
        icon: Images,
        area: "galerie",
      },
    ],
    betreuer: [
      {
        label: "Trainercockpit",
        hint: "Anwesenheit pflegen",
        href: "/admin/trainer",
        icon: Trophy,
        area: "trainer_cockpit",
      },
      {
        label: "LiveCenter",
        hint: "Ticker verwalten",
        href: "/admin/live",
        icon: Radio,
        area: "live_admin",
      },
      {
        label: "Spielerportal",
        hint: "Rückmeldungen prüfen",
        href: "/admin/spielerportal",
        icon: Users,
        area: "spielerportal",
      },
      ...common,
    ],
    spieler: [],
  };

  return roleActions[role];
}

function PanelHeader({
  icon,
  eyebrow,
  title,
  href,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-club-red/10 text-club-light-red">
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-club-light-red">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-black text-white">{title}</h2>
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600 transition hover:text-club-light-red"
        >
          Öffnen <ArrowUpRight size={13} />
        </Link>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-white/[0.08] bg-black/15 px-4 py-7 text-center text-sm leading-6 text-zinc-600">
      {text}
    </div>
  );
}

function SeasonMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-black/20 p-4">
      <p
        className={`text-2xl font-black tabular-nums ${
          accent ? "text-club-light-red" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-zinc-600">
        {label}
      </p>
    </div>
  );
}

function getActivityConfig(action: ActivityRow["action"]) {
  if (action === "insert")
    return { label: "Angelegt", dot: "bg-emerald-400" };
  if (action === "delete") return { label: "Gelöscht", dot: "bg-red-400" };
  return { label: "Bearbeitet", dot: "bg-amber-400" };
}
