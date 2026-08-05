import {
  Award,
  Clock3,
  Goal,
  Medal,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { requireRole } from "../../../lib/auth/roles";
import {
  getAvailableSeasons,
  getPlayerSeasonStats,
} from "../../../lib/player-statistics";

type PageProps = {
  searchParams: Promise<{ season?: string }>;
};

export default async function AdminStatisticsPage({ searchParams }: PageProps) {
  await requireRole(["administrator", "vorstand", "trainer", "betreuer"]);

  const params = await searchParams;
  const seasons = await getAvailableSeasons();
  const season =
    params.season && seasons.includes(params.season)
      ? params.season
      : seasons[0];
  const stats = await getPlayerSeasonStats(season);

  const leaders = {
    goals: [...stats].sort((a, b) => b.goals - a.goals)[0],
    assists: [...stats].sort((a, b) => b.assists - a.assists)[0],
    appearances: [...stats].sort((a, b) => b.appearances - a.appearances)[0],
    minutes: [...stats].sort((a, b) => b.minutes - a.minutes)[0],
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="club-eyebrow">Sportliche Auswertung</p>
          <h1 className="club-heading mt-2">Spielerstatistiken</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Die Werte werden aus beendeten Spielen, Aufstellungen und
            Match-Center-Ereignissen automatisch berechnet.
          </p>
        </div>

        <form method="get">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
              Saison
            </span>
            <select
              name="season"
              defaultValue={season}
              className="admin-input min-w-40"
            >
              {seasons.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="club-button-secondary mt-3 w-full">
            Saison anzeigen
          </button>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <LeaderCard
          icon={<Goal size={19} />}
          label="Top-Torschütze"
          player={leaders.goals}
          value={leaders.goals?.goals ?? 0}
        />
        <LeaderCard
          icon={<Sparkles size={19} />}
          label="Top-Vorlagen"
          player={leaders.assists}
          value={leaders.assists?.assists ?? 0}
        />
        <LeaderCard
          icon={<Users size={19} />}
          label="Meiste Einsätze"
          player={leaders.appearances}
          value={leaders.appearances?.appearances ?? 0}
        />
        <LeaderCard
          icon={<Clock3 size={19} />}
          label="Meiste Minuten"
          player={leaders.minutes}
          value={leaders.minutes?.minutes ?? 0}
        />
      </div>

      <section className="club-card mt-6 overflow-hidden">
        <div className="border-b border-white/10 px-5 py-5 sm:px-6">
          <p className="club-eyebrow">Saison {season}</p>
          <h2 className="mt-2 text-2xl font-black uppercase">
            Alle Spieler
          </h2>
        </div>

        {!stats.length ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            Noch keine Spieler oder beendeten Spiele vorhanden.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left">
              <thead className="bg-white/[0.035] text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Spieler</th>
                  <th className="px-3 py-4 text-center">Sp.</th>
                  <th className="px-3 py-4 text-center">Start</th>
                  <th className="px-3 py-4 text-center">Tore</th>
                  <th className="px-3 py-4 text-center">Vorlagen</th>
                  <th className="px-3 py-4 text-center">Gelb</th>
                  <th className="px-3 py-4 text-center">Rot</th>
                  <th className="px-3 py-4 text-center">Min.</th>
                  <th className="px-3 py-4 text-center">MVP</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((player) => (
                  <tr
                    key={player.playerId}
                    className="border-t border-white/[0.07]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {player.imageUrl ? (
                          <img
                            src={player.imageUrl}
                            alt=""
                            className="h-11 w-11 rounded-xl object-cover object-top"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-white/[0.05]" />
                        )}
                        <div>
                          <p className="font-black text-white">
                            {player.shirtNumber !== null
                              ? `#${player.shirtNumber} `
                              : ""}
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {player.position} · {player.squad}
                          </p>
                        </div>
                      </div>
                    </td>
                    <NumberCell value={player.appearances} />
                    <NumberCell value={player.starts} />
                    <NumberCell value={player.goals} highlight />
                    <NumberCell value={player.assists} />
                    <NumberCell value={player.yellowCards} />
                    <NumberCell value={player.redCards} danger />
                    <NumberCell value={player.minutes} />
                    <NumberCell value={player.playerOfMatch} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-6 rounded-3xl border border-amber-500/15 bg-amber-950/20 p-5 text-sm leading-6 text-amber-100">
        <p className="font-black">So werden Vorlagen und Minuten berechnet</p>
        <p className="mt-2 text-amber-200/80">
          Bei einem Tor zählt der zweite ausgewählte Spieler als Vorlagengeber.
          Bei Auswechslungen ist der erste Spieler der eingewechselte und der
          zweite Spieler der ausgewechselte Spieler. Dadurch können Einsatzzeit
          und Vorlagen automatisch berechnet werden.
        </p>
      </div>
    </div>
  );
}

function LeaderCard({
  icon,
  label,
  player,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  player: Awaited<ReturnType<typeof getPlayerSeasonStats>>[number] | undefined;
  value: number;
}) {
  return (
    <article className="club-card p-5">
      <div className="club-icon-box">{icon}</div>
      <p className="mt-5 text-3xl font-black tabular-nums">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-3 truncate text-sm font-bold text-zinc-200">
        {player ? `${player.firstName} ${player.lastName}` : "Noch keine Daten"}
      </p>
    </article>
  );
}

function NumberCell({
  value,
  highlight = false,
  danger = false,
}: {
  value: number;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <td
      className={`px-3 py-4 text-center text-sm font-black tabular-nums ${
        danger
          ? "text-red-400"
          : highlight
            ? "text-club-light-red"
            : "text-zinc-300"
      }`}
    >
      {value}
    </td>
  );
}
