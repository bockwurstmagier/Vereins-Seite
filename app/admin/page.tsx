import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  Handshake,
  Images,
  Newspaper,
  Palette,
  Plus,
  Radio,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { canAccess, type AdminArea } from "../../lib/auth/permissions";
import { ROLE_LABELS, requireActiveProfile } from "../../lib/auth/roles";
import { createClient } from "../../lib/supabase/server";

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

type ActivityRow = {
  id: number;
  action: "insert" | "update" | "delete";
  entity_type: string;
  title: string | null;
  created_at: string;
};

export default async function AdminDashboard() {
  const profile = await requireActiveProfile();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [
    matchesCountResult,
    newsCountResult,
    sponsorsCountResult,
    playersCountResult,
    galleryCountResult,
    upcomingMatchResult,
    recentNewsResult,
    upcomingEventsResult,
    activityResult,
    finishedMatchesResult,
  ] = await Promise.all([
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("news").select("*", { count: "exact", head: true }),
    supabase.from("sponsors").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("gallery_images").select("*", { count: "exact", head: true }),
    supabase
      .from("matches")
      .select("id, competition, home_team, away_team, match_date, location")
      .eq("status", "scheduled")
      .gte("match_date", now)
      .order("match_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("news")
      .select("id, title, category, status, published_at, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("club_events")
      .select("id, title, event_type, starts_at, location, is_public")
      .gte("starts_at", now)
      .order("starts_at", { ascending: true })
      .limit(4),
    supabase
      .from("activity_logs")
      .select("id, action, entity_type, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("matches")
      .select("home_team, away_team, home_score, away_score")
      .eq("status", "finished")
      .not("home_score", "is", null)
      .not("away_score", "is", null),
  ]);

  const nextMatch = upcomingMatchResult.data;
  const recentNews = recentNewsResult.data ?? [];
  const upcomingEvents = upcomingEventsResult.data ?? [];
  const activities = (activityResult.data ?? []) as ActivityRow[];
  const finishedMatches = finishedMatchesResult.data ?? [];

  const season = calculateSeasonStats(finishedMatches);
  const displayName = profile.display_name || profile.email.split("@")[0] || "Admin";

  const statCards = [
    {
      label: "Spiele",
      value: matchesCountResult.count ?? 0,
      hint: `${season.wins} Siege in ${season.games} Spielen`,
      icon: CalendarDays,
      href: "/admin/spiele",
      area: "spiele" as AdminArea,
    },
    {
      label: "Aktive Spieler",
      value: playersCountResult.count ?? 0,
      hint: "Mannschaft & Staff",
      icon: Users,
      href: "/admin/team",
      area: "team" as AdminArea,
    },
    {
      label: "News",
      value: newsCountResult.count ?? 0,
      hint: `${recentNews.filter((item) => item.status === "published").length} zuletzt veröffentlicht`,
      icon: Newspaper,
      href: "/admin/news",
      area: "news" as AdminArea,
    },
    {
      label: "Sponsoren",
      value: sponsorsCountResult.count ?? 0,
      hint: "Partner des Vereins",
      icon: Handshake,
      href: "/admin/sponsoren",
      area: "sponsoren" as AdminArea,
    },
    {
      label: "Galerie",
      value: galleryCountResult.count ?? 0,
      hint: "Bilder im Medienbereich",
      icon: Images,
      href: "/admin/galerie",
      area: "galerie" as AdminArea,
    },
  ].filter((card) => canAccess(profile.role, card.area));

  const quickActions = [
    { label: "Neues Spiel", href: "/admin/spiele#new-match", icon: CalendarDays, area: "spiele" as AdminArea },
    { label: "News schreiben", href: "/admin/news#new-news", icon: Newspaper, area: "news" as AdminArea },
    { label: "Termin anlegen", href: "/admin/termine", icon: CalendarClock, area: "termine" as AdminArea },
    { label: "Social Grafik", href: "/admin/social", icon: Palette, area: "social_studio" as AdminArea },
  ].filter((action) => canAccess(profile.role, action.area));

  return (
    <div className="mx-auto max-w-[1500px]">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.07] via-white/[0.035] to-club-red/[0.07] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="pointer-events-none absolute right-[-7rem] top-[-8rem] h-72 w-72 rounded-full bg-club-red/20 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-[-7rem] left-[25%] h-48 w-48 rounded-full bg-club-burgundy/20 blur-[80px]" />

        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-club-light-red/20 bg-club-red/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-club-light-red">
                Admin 2.0
              </span>
              <span className="rounded-full border border-emerald-500/15 bg-emerald-950/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
                System online
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Willkommen, {displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Deine Vereinszentrale für Sport, Inhalte und Organisation. Du bist als {" "}
              <span className="font-bold text-zinc-200">{ROLE_LABELS[profile.role]}</span> angemeldet.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/25 px-4 text-[10px] font-black uppercase tracking-wider text-zinc-300 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-club-light-red/25 hover:bg-white/[0.06] hover:text-white"
                >
                  <Icon size={16} className="text-club-light-red" aria-hidden="true" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-[1.75rem] border border-white/[0.07] bg-white/[0.035] p-5 transition duration-200 hover:-translate-y-1 hover:border-club-light-red/20 hover:bg-white/[0.055]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-club-red/10 text-club-light-red">
                  <Icon size={19} aria-hidden="true" />
                </div>
                <ArrowUpRight size={16} className="text-zinc-700 transition group-hover:text-club-light-red" aria-hidden="true" />
              </div>
              <p className="mt-6 text-3xl font-black tabular-nums text-white">{card.value}</p>
              <p className="mt-1 text-xs font-black uppercase tracking-wider text-zinc-400">{card.label}</p>
              <p className="mt-2 text-[11px] leading-5 text-zinc-600">{card.hint}</p>
            </Link>
          );
        })}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
          <PanelHeader
            icon={<Trophy size={18} aria-hidden="true" />}
            eyebrow="Spielbetrieb"
            title="Nächstes Spiel"
            href="/admin/spiele"
          />

          {nextMatch ? (
            <div className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-club-burgundy/40 via-black/40 to-black/65 p-5 sm:p-7">
              <div className="absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full bg-club-red/20 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full border border-club-light-red/20 bg-club-red/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-club-light-red">
                    {nextMatch.competition}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                    {dateFormatter.format(new Date(nextMatch.match_date))}
                  </span>
                </div>

                <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                  <p className="text-lg font-black leading-tight text-white sm:text-2xl">{nextMatch.home_team}</p>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-club-light-red/20 bg-black/35 text-sm font-black italic text-club-light-red">VS</div>
                  <p className="text-lg font-black leading-tight text-white sm:text-2xl">{nextMatch.away_team}</p>
                </div>

                <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2">
                    <Clock3 size={14} className="text-club-light-red" aria-hidden="true" />
                    {timeFormatter.format(new Date(nextMatch.match_date))} Uhr
                  </span>
                  {nextMatch.location && (
                    <span className="rounded-xl bg-black/25 px-3 py-2">{nextMatch.location}</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState text="Aktuell ist kein kommendes Spiel eingetragen." />
          )}
        </section>

        <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
          <PanelHeader
            icon={<Activity size={18} aria-hidden="true" />}
            eyebrow="Saison"
            title="Leistungsübersicht"
            href="/admin/statistiken"
          />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <SeasonMetric label="Spiele" value={season.games} />
            <SeasonMetric label="Siege" value={season.wins} accent />
            <SeasonMetric label="Remis" value={season.draws} />
            <SeasonMetric label="Niederlagen" value={season.losses} />
          </div>

          <div className="mt-4 rounded-3xl border border-white/[0.07] bg-black/20 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-500">Siegquote</span>
              <span className="font-black text-white">{season.winRate}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-club-red to-club-light-red shadow-[0_0_14px_rgba(239,51,64,0.55)]"
                style={{ width: `${season.winRate}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-zinc-600">Tore</p>
                <p className="mt-1 text-lg font-black text-white">{season.goalsFor}</p>
              </div>
              <div>
                <p className="text-zinc-600">Gegentore</p>
                <p className="mt-1 text-lg font-black text-white">{season.goalsAgainst}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
          <PanelHeader
            icon={<CalendarClock size={18} aria-hidden="true" />}
            eyebrow="Organisation"
            title="Nächste Termine"
            href="/admin/termine"
          />

          {!upcomingEvents.length ? (
            <EmptyState text="Keine kommenden Termine vorhanden." />
          ) : (
            <div className="mt-5 space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/termine/${event.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/20 p-3 transition hover:border-club-light-red/15 hover:bg-white/[0.035]"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-club-red/10 text-club-light-red">
                    <span className="text-[9px] font-black uppercase">{shortDateFormatter.format(new Date(event.starts_at)).slice(3)}</span>
                    <span className="text-sm font-black">{new Date(event.starts_at).toLocaleDateString("de-DE", { day: "2-digit", timeZone: "Europe/Berlin" })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-white">{event.title}</p>
                    <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wider text-zinc-600">{event.event_type} · {timeFormatter.format(new Date(event.starts_at))} Uhr</p>
                  </div>
                  {!event.is_public && <CircleDot size={14} className="text-amber-400" aria-label="Interner Termin" />}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6">
          <PanelHeader
            icon={<Newspaper size={18} aria-hidden="true" />}
            eyebrow="Redaktion"
            title="Neueste Beiträge"
            href="/admin/news"
          />

          {!recentNews.length ? (
            <EmptyState text="Noch keine News vorhanden." />
          ) : (
            <div className="mt-5 space-y-3">
              {recentNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/news/${item.id}`}
                  className="block rounded-2xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-club-light-red/15 hover:bg-white/[0.035]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-club-light-red">{item.category}</p>
                      <p className="mt-2 line-clamp-2 text-sm font-black leading-5 text-white">{item.title}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wider ${item.status === "published" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>
                      {item.status === "published" ? "Live" : "Entwurf"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-6 lg:col-span-2 xl:col-span-1">
          <PanelHeader
            icon={<CheckCircle2 size={18} aria-hidden="true" />}
            eyebrow="Protokoll"
            title="Letzte Aktivitäten"
            href="/admin/aktivitaeten"
          />

          {!activities.length ? (
            <EmptyState text="Noch keine Aktivitäten protokolliert." />
          ) : (
            <div className="mt-5 space-y-1">
              {activities.map((activity) => {
                const config = getActivityConfig(activity.action);
                return (
                  <div key={activity.id} className="flex gap-3 border-b border-white/[0.055] py-3 last:border-0">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${config.dot}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-zinc-200">{activity.title || "Änderung im System"}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">{config.label} · {activity.entity_type} · {timeFormatter.format(new Date(activity.created_at))} Uhr</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="mt-5 rounded-[2rem] border border-white/[0.07] bg-gradient-to-r from-club-burgundy/20 via-white/[0.035] to-transparent p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-club-red/15 text-club-light-red">
              <Sparkles size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Bereit für den nächsten Beitrag?</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Erstelle Texte oder Grafiken direkt aus euren Vereinsdaten.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canAccess(profile.role, "text_assistent") && (
              <Link href="/admin/text-assistent" className="club-button-secondary">Text-Assistent</Link>
            )}
            {canAccess(profile.role, "social_studio") && (
              <Link href="/admin/social" className="club-button-primary">Social Studio</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
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
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-club-red/10 text-club-light-red">{icon}</div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-club-light-red">{eyebrow}</p>
          <h2 className="mt-1 text-lg font-black text-white">{title}</h2>
        </div>
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600 transition hover:text-club-light-red">
          Öffnen <ArrowUpRight size={13} aria-hidden="true" />
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

function SeasonMetric({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-black/20 p-4">
      <p className={`text-2xl font-black tabular-nums ${accent ? "text-club-light-red" : "text-white"}`}>{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-zinc-600">{label}</p>
    </div>
  );
}

function calculateSeasonStats(matches: Array<{ home_team: string; away_team: string; home_score: number | null; away_score: number | null }>) {
  const clubName = "middelich-resse";
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const match of matches) {
    if (match.home_score === null || match.away_score === null) continue;
    const isHome = match.home_team.toLowerCase().includes(clubName);
    const own = isHome ? match.home_score : match.away_score;
    const opponent = isHome ? match.away_score : match.home_score;
    goalsFor += own;
    goalsAgainst += opponent;
    if (own > opponent) wins += 1;
    else if (own === opponent) draws += 1;
    else losses += 1;
  }

  const games = wins + draws + losses;
  return {
    games,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    winRate: games ? Math.round((wins / games) * 100) : 0,
  };
}

function getActivityConfig(action: ActivityRow["action"]) {
  if (action === "insert") return { label: "Angelegt", dot: "bg-emerald-400" };
  if (action === "delete") return { label: "Gelöscht", dot: "bg-red-400" };
  return { label: "Bearbeitet", dot: "bg-amber-400" };
}
