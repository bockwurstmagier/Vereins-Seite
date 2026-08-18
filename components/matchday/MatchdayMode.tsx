"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  Goal,
  Radio,
  RefreshCw,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

type Match = {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  competition: string;
  location: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  current_minute: number | null;
  clock_phase: string | null;
  player_of_match_id: string | null;
};

type EventRow = {
  id: string;
  match_id: string;
  event_type: string;
  minute: number;
  player_id: string | null;
  secondary_player_id: string | null;
  description: string | null;
  created_at: string;
};

type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;
  position: string | null;
  shirt_number: number | null;
  image_url: string | null;
};

type LineupRow = {
  match_id: string;
  player_id: string;
  is_starting: boolean;
  position_label: string | null;
  shirt_number: number | null;
};

type StandingRow = {
  position: number;
  team_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
  logo_url: string | null;
  is_club: boolean;
};

type Props = {
  mode: "idle" | "countdown" | "live" | "halftime" | "finished";
  match: Match | null;
  events: EventRow[];
  players: PlayerRow[];
  lineup: LineupRow[];
  standings: StandingRow[];
  nextMatch: Match | null;
  mediaReady: boolean;
  clubLogoSrc: string;
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
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

export default function MatchdayMode(props: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let timer: number | null = null;
    const tick = () => setNow(Date.now());
    const start = () => {
      if (timer !== null || document.visibilityState !== "visible") return;
      tick();
      timer = window.setInterval(tick, 15_000);
    };
    const stop = () => { if (timer !== null) window.clearInterval(timer); timer = null; };
    const onVisibility = () => document.visibilityState === "visible" ? start() : stop();
    start(); document.addEventListener("visibilitychange", onVisibility);
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  useEffect(() => {
    if (!["live", "halftime"].includes(props.mode)) return;
    let timer: number | null = null;
    const start = () => {
      if (timer !== null || document.visibilityState !== "visible") return;
      timer = window.setInterval(() => window.location.reload(), 60_000);
    };
    const stop = () => { if (timer !== null) window.clearInterval(timer); timer = null; };
    const onVisibility = () => {
      if (document.visibilityState === "visible") { window.location.reload(); start(); }
      else stop();
    };
    start(); document.addEventListener("visibilitychange", onVisibility);
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [props.mode]);

  if (!props.match) {
    return (
      <main className="min-h-screen bg-club-black px-4 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <img src={props.clubLogoSrc} alt="" className="mx-auto w-32" />
          <p className="club-eyebrow mt-8">HUJA Matchday Mode</p>
          <h1 className="club-heading mt-3">Kein Spiel in Sicht</h1>
          <p className="mt-4 text-zinc-500">
            Sobald ein Spiel ansteht, schaltet die App automatisch in den
            Matchday Mode.
          </p>
          <Link href="/" className="club-button-primary mt-8 inline-flex">
            Zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  const playerMap = new Map(
    props.players.map((player) => [
      player.id,
      `${player.first_name} ${player.last_name}`,
    ]),
  );

  const starting = props.lineup
    .filter((entry) => entry.is_starting)
    .map((entry) => ({
      ...entry,
      player: props.players.find((player) => player.id === entry.player_id),
    }));

  const target = new Date(props.match.match_date).getTime();
  const diff = Math.max(0, target - now);
  const countdown = {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };

  const recentEvents = props.events.slice(0, 12);

  return (
    <main className="min-h-screen bg-club-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-club-burgundy via-club-dark-red/80 to-black px-4 py-8 sm:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(255,0,30,0.35),transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <img src={props.clubLogoSrc} alt="" className="w-16 sm:w-20" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-club-light-red">
                  HUJA
                </p>
                <p className="text-sm font-black uppercase text-white">
                  Matchday Mode
                </p>
              </div>
            </Link>

            <StatusBadge mode={props.mode} />
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-club-light-red">
              {props.match.competition}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
              {dateFormatter.format(new Date(props.match.match_date))} ·{" "}
              {timeFormatter.format(new Date(props.match.match_date))} Uhr
            </p>

            <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
              <TeamName name={props.match.home_team} />
              <div className="rounded-3xl border border-white/10 bg-black/35 px-4 py-5 shadow-2xl sm:px-8">
                {props.mode === "countdown" ? (
                  <span className="text-xl font-black text-club-light-red sm:text-3xl">
                    VS
                  </span>
                ) : (
                  <span className="text-4xl font-black tabular-nums sm:text-6xl">
                    {props.match.home_score ?? 0}:{props.match.away_score ?? 0}
                  </span>
                )}
              </div>
              <TeamName name={props.match.away_team} />
            </div>

            {props.match.location && (
              <p className="mt-7 text-xs font-bold text-zinc-400">
                📍 {props.match.location}
              </p>
            )}

            {props.mode === "countdown" && (
              <div className="mx-auto mt-8 grid max-w-2xl grid-cols-4 gap-2 sm:gap-3">
                {[
                  [countdown.days, "Tage"],
                  [countdown.hours, "Std."],
                  [countdown.minutes, "Min."],
                  [countdown.seconds, "Sek."],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur"
                  >
                    <p className="text-2xl font-black tabular-nums sm:text-4xl">
                      {String(value).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-zinc-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {["live", "halftime"].includes(props.mode) && (
              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/35 px-4 py-2 text-xs font-black uppercase tracking-wider text-red-300">
                <Radio size={15} className="animate-pulse" />
                {props.mode === "halftime"
                  ? "Halbzeit"
                  : `${props.match.current_minute ?? 0}. Minute`}
              </div>
            )}

            {props.mode === "finished" && (
              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-300">
                <CheckCircle2 size={15} />
                Abpfiff
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {starting.length > 0 && (
          <section className="club-card p-5 sm:p-6">
            <PanelHeader
              icon={<Users size={19} />}
              eyebrow="Unsere Elf"
              title="Aufstellung"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {starting.map((entry) => (
                <div
                  key={entry.player_id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-club-red/15 text-sm font-black text-club-light-red">
                    {entry.shirt_number ?? entry.player?.shirt_number ?? "–"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                      {entry.player
                        ? `${entry.player.first_name} ${entry.player.last_name}`
                        : "Spieler"}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
                      {entry.position_label ?? entry.player?.position ?? "Position"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {recentEvents.length > 0 && (
          <section className="club-card p-5 sm:p-6">
            <PanelHeader
              icon={<Radio size={19} />}
              eyebrow="Live"
              title="Spielereignisse"
            />
            <div className="mt-5 space-y-3">
              {recentEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  playerName={
                    (event.player_id && playerMap.get(event.player_id)) || null
                  }
                />
              ))}
            </div>
          </section>
        )}

        {props.standings.length > 0 && (
          <section className="club-card overflow-hidden">
            <div className="border-b border-white/10 p-5 sm:p-6">
              <PanelHeader
                icon={<Trophy size={19} />}
                eyebrow="Liga"
                title="Live-Tabelle"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-left">
                <thead className="bg-white/[0.03] text-[9px] font-black uppercase tracking-wider text-zinc-600">
                  <tr>
                    <th className="px-5 py-3">Platz</th>
                    <th className="px-3 py-3">Team</th>
                    <th className="px-3 py-3 text-center">Sp.</th>
                    <th className="px-3 py-3 text-center">Tore</th>
                    <th className="px-5 py-3 text-right">Pkt.</th>
                  </tr>
                </thead>
                <tbody>
                  {props.standings.map((row) => (
                    <tr
                      key={row.team_name}
                      className={`border-t border-white/[0.06] ${
                        row.is_club ? "bg-club-red/[0.08]" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-black text-zinc-400">
                        {row.position}.
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1">
                            {row.logo_url ? (
                              <img
                                src={row.logo_url}
                                alt=""
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <Shield size={16} className="text-zinc-500" />
                            )}
                          </div>
                          <span
                            className={`font-black ${
                              row.is_club ? "text-club-light-red" : "text-white"
                            }`}
                          >
                            {row.team_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center text-sm text-zinc-400">
                        {row.played}
                      </td>
                      <td className="px-3 py-4 text-center text-sm text-zinc-400">
                        {row.goals_for}:{row.goals_against}
                      </td>
                      <td className="px-5 py-4 text-right font-black text-white">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {props.mode === "finished" && (
          <section className="rounded-[2rem] border border-club-light-red/20 bg-gradient-to-r from-club-burgundy/45 via-black/55 to-black p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="club-eyebrow">Nach dem Abpfiff</p>
                <h2 className="mt-2 text-2xl font-black uppercase">
                  Medienpaket bereit
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Spielbericht, Social-Media-Texte und Grafiken können direkt
                  erstellt oder geöffnet werden.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/mediencenter?match=${props.match.id}`}
                  className="club-button-primary"
                >
                  <Sparkles size={17} />
                  HUJA AI Engine
                </Link>
                <Link
                  href={`/admin/autographics?match=${props.match.id}`}
                  className="club-button-secondary"
                >
                  AutoGraphics
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {props.nextMatch && (
          <section className="club-card p-5 sm:p-6">
            <PanelHeader
              icon={<CalendarDays size={19} />}
              eyebrow="Als Nächstes"
              title="Nächstes Spiel"
            />
            <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-5 text-center">
              <p className="font-black">
                {props.nextMatch.home_team}
                <span className="mx-3 text-club-light-red">vs.</span>
                {props.nextMatch.away_team}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                {dateFormatter.format(new Date(props.nextMatch.match_date))} ·{" "}
                {timeFormatter.format(new Date(props.nextMatch.match_date))} Uhr
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function TeamName({ name }: { name: string }) {
  return (
    <div>
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-white/10 bg-black/25 sm:h-28 sm:w-28">
        <Shield size={34} className="text-club-light-red" />
      </div>
      <p className="mt-4 text-sm font-black leading-tight sm:text-2xl">{name}</p>
    </div>
  );
}

function StatusBadge({
  mode,
}: {
  mode: "idle" | "countdown" | "live" | "halftime" | "finished";
}) {
  const config = {
    idle: ["Bereit", "bg-white/10 text-zinc-300"],
    countdown: ["Matchday", "bg-club-red/20 text-club-light-red"],
    live: ["Live", "bg-red-500/20 text-red-300"],
    halftime: ["Halbzeit", "bg-amber-500/20 text-amber-300"],
    finished: ["Abpfiff", "bg-emerald-500/20 text-emerald-300"],
  }[mode];

  return (
    <span className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider ${config[1]}`}>
      {config[0]}
    </span>
  );
}

function PanelHeader({
  icon,
  eyebrow,
  title,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="club-icon-box">{icon}</div>
      <div>
        <p className="club-eyebrow">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black uppercase">{title}</h2>
      </div>
    </div>
  );
}

function EventCard({
  event,
  playerName,
}: {
  event: EventRow;
  playerName: string | null;
}) {
  const icon =
    event.event_type === "goal" ? (
      <Goal size={18} />
    ) : event.event_type.includes("card") ? (
      <span className="h-5 w-3 rounded-sm bg-amber-400" />
    ) : (
      <CircleDot size={18} />
    );

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-club-red/10 text-club-light-red">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-black">
          {playerName || event.description || event.event_type}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {event.description || event.event_type}
        </p>
      </div>
      <span className="text-xs font-black text-club-light-red">
        {event.minute}'
      </span>
    </div>
  );
}
