import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Handshake,
  Newspaper,
  Server,
  ShieldCheck,
  Trophy,
  UserCircle2,
  Users,
} from "lucide-react";

import { createClient } from "../../lib/supabase/server";

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    matchesCountResult,
    newsCountResult,
    sponsorsCountResult,
    playersCountResult,
    upcomingMatchesResult,
    finishedMatchesResult,
    recentNewsResult,
  ] = await Promise.all([
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("news").select("*", { count: "exact", head: true }),
    supabase.from("sponsors").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }),

    supabase
      .from("matches")
      .select(
        "id, competition, home_team, away_team, match_date, location, status",
      )
      .eq("status", "scheduled")
      .gte("match_date", new Date().toISOString())
      .order("match_date", { ascending: true })
      .limit(3),

    supabase
      .from("matches")
      .select(
        "id, competition, home_team, away_team, home_score, away_score, match_date",
      )
      .eq("status", "finished")
      .order("match_date", { ascending: false })
      .limit(3),

    supabase
      .from("news")
      .select("id, title, category, status, published_at, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const stats = [
    {
      label: "Spiele",
      value: matchesCountResult.count ?? 0,
      icon: CalendarDays,
      href: "/admin/spiele",
    },
    {
      label: "News",
      value: newsCountResult.count ?? 0,
      icon: Newspaper,
      href: "/admin/news",
    },
    {
      label: "Sponsoren",
      value: sponsorsCountResult.count ?? 0,
      icon: Handshake,
      href: "/admin/sponsoren",
    },
    {
      label: "Spieler",
      value: playersCountResult.count ?? 0,
      icon: Users,
      href: "/admin/team",
    },
  ];

  const upcomingMatches = upcomingMatchesResult.data ?? [];
  const finishedMatches = finishedMatchesResult.data ?? [];
  const recentNews = recentNewsResult.data ?? [];

  const missingTables = [
    sponsorsCountResult.error ? "sponsors" : null,
    playersCountResult.error ? "players" : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl">
      <section className="club-card overflow-hidden">
        <div className="relative px-5 py-7 sm:px-7 sm:py-9">
          <div className="pointer-events-none absolute right-[-4rem] top-[-4rem] h-52 w-52 rounded-full bg-club-red/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="club-eyebrow">Vereinsmanager 2.0</p>

              <h1 className="mt-2 text-3xl font-black uppercase leading-tight sm:text-4xl">
                Willkommen zurück
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                Von hier verwaltest du Spiele, News, Mannschaften, Sponsoren
                und alle Inhalte der Vereins-App.
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-3xl border border-white/10 bg-black/30 px-4 py-3">
              <div className="club-icon-box">
                <UserCircle2 size={20} aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  Angemeldet als
                </p>

                <p className="mt-1 max-w-52 truncate text-sm font-bold text-white">
                  {user?.email ?? "Administrator"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <a
              key={stat.label}
              href={stat.href}
              className="club-card group p-5 transition hover:-translate-y-1 hover:border-club-light-red/25"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="club-icon-box">
                  <Icon size={19} aria-hidden="true" />
                </div>

                <ExternalLink
                  size={15}
                  className="text-zinc-700 transition group-hover:text-club-light-red"
                  aria-hidden="true"
                />
              </div>

              <p className="mt-6 text-3xl font-black tabular-nums">
                {stat.value}
              </p>

              <p className="mt-1 text-xs font-black uppercase tracking-wider text-zinc-500">
                {stat.label}
              </p>
            </a>
          );
        })}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="club-card p-5 sm:p-6">
          <SectionHeader
            icon={<CalendarDays size={19} aria-hidden="true" />}
            eyebrow="Nächste Termine"
            title="Kommende Spiele"
            href="/admin/spiele"
          />

          {!upcomingMatches.length ? (
            <EmptyState text="Aktuell sind keine kommenden Spiele eingetragen." />
          ) : (
            <div className="mt-5 space-y-3">
              {upcomingMatches.map((match) => {
                const matchDate = new Date(match.match_date);

                return (
                  <article
                    key={match.id}
                    className="rounded-3xl border border-white/[0.08] bg-black/25 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-club-light-red/25 bg-club-red/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-club-light-red">
                        {match.competition}
                      </span>

                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                        Geplant
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-black leading-tight text-white">
                      {match.home_team}
                      <span className="mx-2 text-club-light-red">vs.</span>
                      {match.away_team}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays
                          size={14}
                          className="text-club-light-red"
                          aria-hidden="true"
                        />
                        {dateFormatter.format(matchDate)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Clock3
                          size={14}
                          className="text-club-light-red"
                          aria-hidden="true"
                        />
                        {timeFormatter.format(matchDate)} Uhr
                      </span>
                    </div>

                    {match.location && (
                      <p className="mt-2 truncate text-xs text-zinc-600">
                        {match.location}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="club-card p-5 sm:p-6">
          <SectionHeader
            icon={<Newspaper size={19} aria-hidden="true" />}
            eyebrow="Redaktion"
            title="Letzte News"
            href="/admin/news"
          />

          {!recentNews.length ? (
            <EmptyState text="Noch keine News vorhanden." />
          ) : (
            <div className="mt-5 space-y-3">
              {recentNews.map((item) => {
                const displayDate = item.published_at || item.created_at;

                return (
                  <a
                    key={item.id}
                    href={`/admin/news/${item.id}`}
                    className="block rounded-3xl border border-white/[0.08] bg-black/25 p-4 transition hover:border-club-light-red/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-club-light-red">
                          {item.category}
                        </p>

                        <h3 className="mt-2 line-clamp-2 text-sm font-black leading-5 text-white">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                          {dateFormatter.format(new Date(displayDate))}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wider ${
                          item.status === "published"
                            ? "border-emerald-500/20 bg-emerald-950/30 text-emerald-300"
                            : "border-amber-500/20 bg-amber-950/30 text-amber-300"
                        }`}
                      >
                        {item.status === "published"
                          ? "Veröffentlicht"
                          : "Entwurf"}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="club-card p-5 sm:p-6">
          <SectionHeader
            icon={<Trophy size={19} aria-hidden="true" />}
            eyebrow="Rückblick"
            title="Letzte Ergebnisse"
            href="/admin/spiele"
          />

          {!finishedMatches.length ? (
            <EmptyState text="Noch keine beendeten Spiele eingetragen." />
          ) : (
            <div className="mt-5 space-y-3">
              {finishedMatches.map((match) => (
                <article
                  key={match.id}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-3xl border border-white/[0.08] bg-black/25 p-4 text-center"
                >
                  <p className="min-w-0 text-sm font-black leading-tight text-zinc-200">
                    {match.home_team}
                  </p>

                  <div>
                    <p className="text-2xl font-black tabular-nums text-white">
                      {match.home_score ?? 0}
                      <span className="mx-1.5 text-club-light-red">:</span>
                      {match.away_score ?? 0}
                    </p>

                    <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-zinc-600">
                      Endstand
                    </p>
                  </div>

                  <p className="min-w-0 text-sm font-black leading-tight text-zinc-200">
                    {match.away_team}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="club-card p-5 sm:p-6">
          <SectionHeader
            icon={<Activity size={19} aria-hidden="true" />}
            eyebrow="Technik"
            title="Systemstatus"
          />

          <div className="mt-5 space-y-3">
            <SystemRow
              icon={<Database size={18} aria-hidden="true" />}
              label="Supabase-Datenbank"
              value="Verbunden"
              healthy={!matchesCountResult.error && !newsCountResult.error}
            />

            <SystemRow
              icon={<ShieldCheck size={18} aria-hidden="true" />}
              label="Admin-Sitzung"
              value={user ? "Aktiv" : "Nicht aktiv"}
              healthy={Boolean(user)}
            />

            <SystemRow
              icon={<Server size={18} aria-hidden="true" />}
              label="Öffentliche Website"
              value="Bereit"
              healthy
            />

            <SystemRow
              icon={<CheckCircle2 size={18} aria-hidden="true" />}
              label="Fehlende Module"
              value={
                missingTables.length
                  ? missingTables.join(", ")
                  : "Keine"
              }
              healthy={!missingTables.length}
            />
          </div>

          {missingTables.length > 0 && (
            <p className="mt-4 rounded-2xl border border-amber-500/15 bg-amber-950/20 px-4 py-3 text-xs leading-5 text-amber-200">
              Die Module {missingTables.join(" und ")} sind noch nicht als
              Datenbanktabellen eingerichtet. Das Dashboard funktioniert
              trotzdem und zeigt dort zunächst 0 an.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionHeader({
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
        <div className="club-icon-box">{icon}</div>

        <div>
          <p className="club-eyebrow">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-black uppercase text-white">
            {title}
          </h2>
        </div>
      </div>

      {href && (
        <a
          href={href}
          className="text-[9px] font-black uppercase tracking-[0.16em] text-club-light-red"
        >
          Öffnen
        </a>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center text-sm leading-6 text-zinc-500">
      {text}
    </div>
  );
}

function SystemRow({
  icon,
  label,
  value,
  healthy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  healthy: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-white/[0.08] bg-black/25 p-4">
      <div className="club-icon-box">{icon}</div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-white">{label}</p>
        <p className="mt-1 truncate text-xs text-zinc-500">{value}</p>
      </div>

      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          healthy
            ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]"
            : "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)]"
        }`}
        aria-label={healthy ? "In Ordnung" : "Hinweis"}
      />
    </div>
  );
}
