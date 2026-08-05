import { notFound } from "next/navigation";
import { Circle, Radio, Shirt, Trophy, Users } from "lucide-react";
import { getPublicMatchCenterMatch } from "../../../lib/match-center";

type PageProps = { params: Promise<{ id: string }> };

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default async function PublicMatchCenterPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getPublicMatchCenterMatch(id);
  if (!data) notFound();

  const { match, players, events, squad } = data;
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const starters = squad.filter((entry) => entry.role === "starter");
  const bench = squad.filter((entry) => entry.role === "bench");
  const playerOfMatch = match.player_of_match_id ? playerMap.get(match.player_of_match_id) : null;

  return (
    <main className="min-h-screen bg-club-black px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/match-center" className="club-eyebrow">Zurück zur Übersicht</a>

        <section className="club-card mt-6 overflow-hidden">
          <div className="border-b border-white/10 bg-gradient-to-r from-club-burgundy/70 to-transparent px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.2em]">{match.competition} · {match.matchday || "Spieltag"}</p>
              <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${match.status === "live" ? "border-red-500/30 bg-red-950/50 text-red-300" : match.status === "finished" ? "border-emerald-500/20 bg-emerald-950/30 text-emerald-300" : "border-white/10 bg-black/30 text-zinc-400"}`}>
                {match.status === "live" ? `Live · ${match.current_minute}'` : match.status === "finished" ? "Endstand" : "Vorschau"}
              </span>
            </div>
          </div>

          <div className="px-5 py-8 sm:px-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
              <h1 className="text-lg font-black leading-tight sm:text-2xl">{match.home_team}</h1>
              <div>
                <p className="text-5xl font-black tabular-nums sm:text-6xl">
                  {match.home_score ?? 0}<span className="mx-2 text-club-light-red">:</span>{match.away_score ?? 0}
                </p>
                {match.status === "live" && <div className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-300"><Radio size={15} aria-hidden="true" /> Live</div>}
              </div>
              <h1 className="text-lg font-black leading-tight sm:text-2xl">{match.away_team}</h1>
            </div>
            <p className="mt-6 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">{dateFormatter.format(new Date(match.match_date))} Uhr</p>
            {match.location && <p className="mt-2 text-center text-sm text-zinc-600">{match.location}</p>}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="club-card p-5 sm:p-6">
            <div className="flex items-center gap-3"><div className="club-icon-box"><Circle size={19} aria-hidden="true" /></div><div><p className="club-eyebrow">Spielverlauf</p><h2 className="mt-1 text-xl font-black uppercase">Live-Ticker</h2></div></div>
            <div className="mt-6 space-y-3">
              {events.length ? events.map((event) => {
                const player = event.player_id ? playerMap.get(event.player_id) : null;
                const second = event.secondary_player_id ? playerMap.get(event.secondary_player_id) : null;
                return (
                  <article key={event.id} className="flex gap-3 rounded-3xl border border-white/[0.08] bg-black/25 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-club-red/10 text-sm font-black text-club-light-red">{event.minute}'</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-club-light-red">{eventLabel(event.event_type)}</p>
                      <p className="mt-1 text-sm font-black text-white">{player ? `${player.first_name} ${player.last_name}` : event.description || "Vereinsereignis"}</p>
                      {second && <p className="mt-1 text-xs text-zinc-500">für {second.first_name} {second.last_name}</p>}
                      {player && event.description && <p className="mt-1 text-xs text-zinc-500">{event.description}</p>}
                    </div>
                  </article>
                );
              }) : <p className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">Noch keine Ereignisse eingetragen.</p>}
            </div>
          </section>

          <div className="space-y-6">
            <SquadCard title="Startelf" entries={starters} playerMap={playerMap} />
            <SquadCard title="Ersatzbank" entries={bench} playerMap={playerMap} />
          </div>
        </div>

        {(match.report || playerOfMatch) && (
          <section className="club-card mt-6 p-5 sm:p-6">
            <div className="flex items-center gap-3"><div className="club-icon-box"><Trophy size={19} aria-hidden="true" /></div><div><p className="club-eyebrow">Nach dem Spiel</p><h2 className="mt-1 text-xl font-black uppercase">Fazit</h2></div></div>
            {playerOfMatch && <div className="club-card-inner mt-5 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-club-light-red">Spieler des Spiels</p><p className="mt-2 text-lg font-black">{playerOfMatch.first_name} {playerOfMatch.last_name}</p></div>}
            {match.report && <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{match.report}</div>}
          </section>
        )}
      </div>
    </main>
  );
}

function SquadCard({ title, entries, playerMap }: { title: string; entries: { player_id: string }[]; playerMap: Map<string, { first_name: string; last_name: string; shirt_number: number | null; position: string }> }) {
  return (
    <section className="club-card p-5">
      <div className="flex items-center gap-3"><div className="club-icon-box"><Users size={18} aria-hidden="true" /></div><h2 className="text-lg font-black uppercase">{title}</h2></div>
      <div className="mt-5 space-y-2">
        {entries.length ? entries.map((entry) => {
          const player = playerMap.get(entry.player_id);
          if (!player) return null;
          return <div key={entry.player_id} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/25 px-3 py-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-club-red/10 text-sm font-black text-club-light-red">{player.shirt_number ?? <Shirt size={15} />}</span><div><p className="text-sm font-black">{player.first_name} {player.last_name}</p><p className="text-[10px] uppercase tracking-wider text-zinc-600">{player.position}</p></div></div>;
        }) : <p className="text-sm text-zinc-500">Noch nicht veröffentlicht.</p>}
      </div>
    </section>
  );
}

function eventLabel(type: string) {
  if (type === "goal") return "Tor";
  if (type === "yellow_card") return "Gelbe Karte";
  if (type === "red_card") return "Rote Karte";
  if (type === "substitution") return "Auswechslung";
  return "Notiz";
}
