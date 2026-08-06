"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Circle,
  Radio,
  RefreshCw,
  Shirt,
  Trophy,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

import LiveClock from "./LiveClock";
import LiveEventOverlay from "./LiveEventOverlay";
import FormationDisplay from "./FormationDisplay";

import type {
  MatchCenterEvent,
  MatchCenterMatch,
  MatchCenterPlayer,
  MatchSquadEntry,
} from "../../lib/match-center";
import { createClient } from "../../lib/supabase/client";

type LiveMatchCenterProps = {
  initialMatch: MatchCenterMatch;
  players: MatchCenterPlayer[];
  initialEvents: MatchCenterEvent[];
  initialSquad: MatchSquadEntry[];
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default function LiveMatchCenter({
  initialMatch,
  players,
  initialEvents,
  initialSquad,
}: LiveMatchCenterProps) {
  const [match, setMatch] = useState(initialMatch);
  const [events, setEvents] = useState(initialEvents);
  const [squad, setSquad] = useState(initialSquad);
  const [connected, setConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const playerMap = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );

  const refreshMatch = useCallback(async () => {
    const { data } = await supabase
      .from("matches")
      .select(
        "id, competition, matchday, home_team, away_team, match_date, location, home_score, away_score, status, current_minute, clock_phase, clock_started_at, clock_base_minute, clock_resume_phase, report, player_of_match_id, formation",
      )
      .eq("id", initialMatch.id)
      .maybeSingle();

    if (data) {
      setMatch((current) => ({
        ...(data as MatchCenterMatch),
        home_logo_url: current.home_logo_url,
        away_logo_url: current.away_logo_url,
      }));
    }
  }, [initialMatch.id, supabase]);

  const refreshEvents = useCallback(async () => {
    const { data } = await supabase
      .from("match_events")
      .select(
        "id, match_id, event_type, minute, player_id, secondary_player_id, description, created_at",
      )
      .eq("match_id", initialMatch.id)
      .order("minute", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) setEvents(data as MatchCenterEvent[]);
  }, [initialMatch.id, supabase]);

  const refreshSquad = useCallback(async () => {
    const { data } = await supabase
      .from("match_squad")
      .select("id, match_id, player_id, role, sort_order, pitch_x, pitch_y, position_label")
      .eq("match_id", initialMatch.id)
      .order("role", { ascending: true })
      .order("sort_order", { ascending: true });

    if (data) setSquad(data as MatchSquadEntry[]);
  }, [initialMatch.id, supabase]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshMatch(), refreshEvents(), refreshSquad()]);
    setRefreshing(false);
  }, [refreshEvents, refreshMatch, refreshSquad]);

  useEffect(() => {
    const channel = supabase
      .channel(`live-match-${initialMatch.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${initialMatch.id}`,
        },
        (payload) => {
          setMatch((current) => ({
            ...(payload.new as MatchCenterMatch),
            home_logo_url: current.home_logo_url,
            away_logo_url: current.away_logo_url,
          }));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_events",
          filter: `match_id=eq.${initialMatch.id}`,
        },
        () => {
          void refreshEvents();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_squad",
          filter: `match_id=eq.${initialMatch.id}`,
        },
        () => {
          void refreshSquad();
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [initialMatch.id, refreshEvents, refreshSquad, supabase]);

  const starters = squad.filter((entry) => entry.role === "starter");
  const bench = squad.filter((entry) => entry.role === "bench");
  const playerOfMatch = match.player_of_match_id
    ? playerMap.get(match.player_of_match_id)
    : null;

  return (
    <main className="min-h-screen bg-club-black px-4 py-10 text-white">
      <LiveEventOverlay
        events={events}
        players={players}
        homeTeam={match.home_team}
        awayTeam={match.away_team}
        score={`${match.home_score ?? 0}:${match.away_score ?? 0}`}
      />
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <a href="/match-center" className="club-eyebrow">
            Zurück zur Übersicht
          </a>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wider ${
                connected
                  ? "border-emerald-500/20 bg-emerald-950/35 text-emerald-300"
                  : "border-amber-500/20 bg-amber-950/35 text-amber-300"
              }`}
            >
              {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
              {connected ? "Live verbunden" : "Verbindung wird aufgebaut"}
            </span>

            <button
              type="button"
              onClick={() => void refreshAll()}
              aria-label="Daten neu laden"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:text-white"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        <section className="club-card mt-6 overflow-hidden">
          <div className="border-b border-white/10 bg-gradient-to-r from-club-burgundy/70 to-transparent px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.2em]">
                {match.competition} · {match.matchday || "Spieltag"}
              </p>
              <StatusBadge match={match} />
            </div>
          </div>

          <div className="relative overflow-hidden px-5 py-8 sm:px-8">
            {match.status === "live" && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/10 blur-3xl" />
            )}

            <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
              <LiveTeam
                name={match.home_team}
                logoUrl={match.home_logo_url}
              />
              <div>
                <p className="text-5xl font-black tabular-nums sm:text-6xl">
                  {match.home_score ?? 0}
                  <span className="mx-2 text-club-light-red">:</span>
                  {match.away_score ?? 0}
                </p>
                {match.status === "live" && (
                  <div className="mt-3 inline-flex animate-pulse items-center gap-2 text-xs font-black uppercase tracking-wider text-red-300">
                    <Radio size={15} aria-hidden="true" />
                    <LiveClock
                      status={match.status}
                      current_minute={match.current_minute}
                      clock_phase={match.clock_phase}
                      clock_started_at={match.clock_started_at}
                      clock_base_minute={match.clock_base_minute}
                      clock_resume_phase={match.clock_resume_phase}
                      prefix="Live · "
                    />
                  </div>
                )}
              </div>
              <LiveTeam
                name={match.away_team}
                logoUrl={match.away_logo_url}
              />
            </div>
            <p className="relative mt-6 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
              {dateFormatter.format(new Date(match.match_date))} Uhr
            </p>
            {match.location && (
              <p className="relative mt-2 text-center text-sm text-zinc-600">
                {match.location}
              </p>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="club-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="club-icon-box">
                  <Activity size={19} aria-hidden="true" />
                </div>
                <div>
                  <p className="club-eyebrow">Spielverlauf</p>
                  <h2 className="mt-1 text-xl font-black uppercase">
                    Live-Ticker
                  </h2>
                </div>
              </div>

              {match.status === "live" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/15 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-red-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                  Echtzeit
                </span>
              )}
            </div>

            <div className="mt-6 space-y-3" aria-live="polite">
              {events.length ? (
                events.map((event) => {
                  const player = event.player_id
                    ? playerMap.get(event.player_id)
                    : null;
                  const second = event.secondary_player_id
                    ? playerMap.get(event.secondary_player_id)
                    : null;

                  return (
                    <article
                      key={event.id}
                      className="flex gap-3 rounded-3xl border border-white/[0.08] bg-black/25 p-4 transition duration-300"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-club-red/10 text-sm font-black text-club-light-red">
                        {event.minute}'
                      </span>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-club-light-red">
                          {eventLabel(event.event_type)}
                        </p>
                        <p className="mt-1 text-sm font-black text-white">
                          {player
                            ? `${player.first_name} ${player.last_name}`
                            : event.description || "Vereinsereignis"}
                        </p>
                        {second && (
                          <p className="mt-1 text-xs text-zinc-500">
                            für {second.first_name} {second.last_name}
                          </p>
                        )}
                        {player && event.description && (
                          <p className="mt-1 text-xs text-zinc-500">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
                  Noch keine Ereignisse eingetragen.
                </p>
              )}
            </div>
          </section>

          <div className="space-y-6">
            <FormationDisplay entries={squad} players={players} formation={match.formation} />
            <SquadCard
              title="Startelf"
              entries={starters}
              playerMap={playerMap}
            />
            <SquadCard
              title="Ersatzbank"
              entries={bench}
              playerMap={playerMap}
            />
          </div>
        </div>

        {(match.report || playerOfMatch) && (
          <section className="club-card mt-6 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="club-icon-box">
                <Trophy size={19} aria-hidden="true" />
              </div>
              <div>
                <p className="club-eyebrow">Nach dem Spiel</p>
                <h2 className="mt-1 text-xl font-black uppercase">Fazit</h2>
              </div>
            </div>
            {playerOfMatch && (
              <div className="club-card-inner mt-5 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-club-light-red">
                  Spieler des Spiels
                </p>
                <p className="mt-2 text-lg font-black">
                  {playerOfMatch.first_name} {playerOfMatch.last_name}
                </p>
              </div>
            )}
            {match.report && (
              <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                {match.report}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function LiveTeam({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="min-w-0">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white p-2.5 shadow-[0_15px_45px_rgba(0,0,0,.25)] sm:h-24 sm:w-24">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`Logo von ${name}`}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-lg font-black text-zinc-500">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <h1 className="mt-3 text-sm font-black leading-tight sm:text-xl">
        {name}
      </h1>
    </div>
  );
}

function StatusBadge({ match }: { match: MatchCenterMatch }) {
  const className =
    match.status === "live"
      ? "border-red-500/30 bg-red-950/50 text-red-300"
      : match.status === "finished"
        ? "border-emerald-500/20 bg-emerald-950/30 text-emerald-300"
        : "border-white/10 bg-black/30 text-zinc-400";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${className}`}
    >
      {match.status === "live" ? (
        <LiveClock
          status={match.status}
          current_minute={match.current_minute}
          clock_phase={match.clock_phase}
          clock_started_at={match.clock_started_at}
          clock_base_minute={match.clock_base_minute}
                      clock_resume_phase={match.clock_resume_phase}
          prefix="Live · "
        />
      ) : match.status === "finished" ? (
        "Endstand"
      ) : (
        "Vorschau"
      )}
    </span>
  );
}

function SquadCard({
  title,
  entries,
  playerMap,
}: {
  title: string;
  entries: MatchSquadEntry[];
  playerMap: Map<string, MatchCenterPlayer>;
}) {
  return (
    <section className="club-card p-5">
      <div className="flex items-center gap-3">
        <div className="club-icon-box">
          <Users size={18} aria-hidden="true" />
        </div>
        <h2 className="text-lg font-black uppercase">{title}</h2>
      </div>
      <div className="mt-5 space-y-2">
        {entries.length ? (
          entries.map((entry) => {
            const player = playerMap.get(entry.player_id);
            if (!player) return null;

            return (
              <div
                key={entry.player_id}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/25 px-3 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-club-red/10 text-sm font-black text-club-light-red">
                  {player.shirt_number ?? <Shirt size={15} />}
                </span>
                <div>
                  <p className="text-sm font-black">
                    {player.first_name} {player.last_name}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    {player.position}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-zinc-500">Noch nicht veröffentlicht.</p>
        )}
      </div>
    </section>
  );
}

function eventLabel(type: MatchCenterEvent["event_type"]) {
  if (type === "goal") return "Tor";
  if (type === "yellow_card") return "Gelbe Karte";
  if (type === "red_card") return "Rote Karte";
  if (type === "substitution") return "Auswechslung";
  return "Notiz";
}
