import {
  Activity,
  Award,
  Goal,
  Home,
  Percent,
  Plane,
  Shield,
  Trophy,
} from "lucide-react";
import { createClient } from "../../lib/supabase/server";
import { getSeasonStats } from "../../lib/sport-center";

export const metadata = {
  title: "Statistiken | SpVgg Middelich-Resse",
};

export default async function StatisticsPage() {
  const supabase = await createClient();
  const stats = await getSeasonStats();
  const [{ data: events }, { data: players }] = await Promise.all([
    supabase
      .from("match_events")
      .select("player_id, event_type")
      .eq("event_type", "goal"),
    supabase
      .from("players")
      .select("id, first_name, last_name, image_url")
      .eq("is_active", true),
  ]);

  const goalCounts = new Map<string, number>();
  for (const event of events ?? []) {
    if (event.player_id) {
      goalCounts.set(
        event.player_id,
        (goalCounts.get(event.player_id) ?? 0) + 1,
      );
    }
  }

  const topScorers = (players ?? [])
    .map((player) => ({
      ...player,
      goals: goalCounts.get(player.id) ?? 0,
    }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  const cards = [
    ["Spiele", stats.played, Trophy],
    ["Siege", stats.wins, Award],
    ["Unentschieden", stats.draws, Shield],
    ["Niederlagen", stats.losses, Activity],
    ["Tore", stats.goalsFor, Goal],
    ["Gegentore", stats.goalsAgainst, Shield],
    ["Punkte", stats.points, Trophy],
    ["Siegquote", `${stats.winRate}%`, Percent],
  ] as const;

  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="club-eyebrow">
          Zurück zur Startseite
        </a>
        <h1 className="club-heading mt-4">Vereinsstatistiken</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Die Werte werden automatisch aus allen beendeten Spielen und den
          Ereignissen im Match-Center berechnet.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <article key={label} className="club-card p-5">
              <div className="club-icon-box">
                <Icon size={19} aria-hidden="true" />
              </div>
              <p className="mt-5 text-3xl font-black tabular-nums">{value}</p>
              <p className="mt-1 text-xs font-black uppercase tracking-wider text-zinc-500">
                {label}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="club-card p-5 sm:p-6">
            <p className="club-eyebrow">Formkurve</p>
            <h2 className="mt-2 text-2xl font-black uppercase">
              Letzte fünf Spiele
            </h2>
            <div className="mt-6 flex gap-3">
              {stats.form.length ? (
                stats.form.map((result, index) => (
                  <span
                    key={`${result}-${index}`}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-base font-black ${
                      result === "W"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : result === "D"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {result}
                  </span>
                ))
              ) : (
                <p className="text-sm text-zinc-500">Noch keine Ergebnisse.</p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat
                icon={<Home size={17} />}
                label="Heimsiege"
                value={`${stats.homeWins}/${stats.homePlayed}`}
              />
              <MiniStat
                icon={<Plane size={17} />}
                label="Auswärtssiege"
                value={`${stats.awayWins}/${stats.awayPlayed}`}
              />
            </div>
          </section>

          <section className="club-card p-5 sm:p-6">
            <p className="club-eyebrow">Top-Torschützen</p>
            <div className="mt-5 space-y-3">
              {topScorers.length ? (
                topScorers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-4 rounded-2xl bg-black/30 p-4"
                  >
                    <span className="text-xl font-black text-club-light-red">
                      {index + 1}
                    </span>
                    {player.image_url ? (
                      <img
                        src={player.image_url}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-white/5" />
                    )}
                    <p className="min-w-0 flex-1 truncate font-black">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-2xl font-black tabular-nums">
                      {player.goals}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">
                  Noch keine Torschützen im Match-Center erfasst.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="text-club-light-red">{icon}</div>
      <p className="mt-3 text-2xl font-black tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </div>
  );
}
