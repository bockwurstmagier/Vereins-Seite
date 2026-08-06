import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  BarChart3,
  Goal,
  Medal,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { requireRole } from "../../../lib/auth/roles";
import { getClubStatisticsPro } from "../../../lib/club-statistics-pro";

type PageProps = {
  searchParams: Promise<{ season?: string }>;
};

export default async function AdminStatisticsPage({ searchParams }: PageProps) {
  await requireRole(["administrator", "vorstand", "trainer", "betreuer"]);
  const { season } = await searchParams;
  const data = await getClubStatisticsPro(season);

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="club-eyebrow">Sportliche Auswertung</p>
          <h1 className="club-heading mt-2">Vereinsstatistik Pro</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Saisonbilanz, ewige Spielerlisten, Rekorde und Gegnerstatistiken
            werden automatisch aus euren Spieldaten berechnet.
          </p>
        </div>

        <form method="get">
          <select
            name="season"
            defaultValue={data.season}
            className="admin-input min-w-40"
          >
            {data.seasons.map((entry) => (
              <option key={entry}>{entry}</option>
            ))}
          </select>
          <button className="club-button-secondary mt-2 w-full">
            Saison laden
          </button>
        </form>
      </div>

      <section className="mt-7 grid grid-cols-2 gap-4 xl:grid-cols-6">
        <Stat label="Spiele" value={data.overview.played} icon={<Trophy size={18} />} />
        <Stat label="Siege" value={data.overview.wins} icon={<Award size={18} />} />
        <Stat label="Punkte" value={data.overview.points} icon={<Medal size={18} />} />
        <Stat label="Tore" value={data.overview.goalsFor} icon={<Goal size={18} />} />
        <Stat label="Siegquote" value={`${data.overview.winRate}%`} icon={<BarChart3 size={18} />} />
        <Stat label="Punkte/Spiel" value={data.overview.pointsPerGame} icon={<Sparkles size={18} />} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Leader
          title="Top-Torschütze"
          icon={<Goal size={19} />}
          player={data.seasonPlayers.slice().sort((a, b) => b.goals - a.goals)[0]}
          valueKey="goals"
        />
        <Leader
          title="Top-Vorlagen"
          icon={<Sparkles size={19} />}
          player={data.seasonPlayers.slice().sort((a, b) => b.assists - a.assists)[0]}
          valueKey="assists"
        />
        <Leader
          title="Meiste Einsätze"
          icon={<Users size={19} />}
          player={data.seasonPlayers.slice().sort((a, b) => b.appearances - a.appearances)[0]}
          valueKey="appearances"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="club-card p-5 sm:p-6">
          <Header title="Vereinsrekorde" icon={<Sparkles size={19} />} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Record title="Höchster Sieg" value={data.records.biggestWin?.score ?? "–"} detail={data.records.biggestWin?.label ?? "Keine Daten"} />
            <Record title="Schnellstes Tor" value={data.records.fastestGoal ? `${data.records.fastestGoal.minute}. Min.` : "–"} detail={data.records.fastestGoal?.player ? `${data.records.fastestGoal.player.first_name} ${data.records.fastestGoal.player.last_name}` : "Keine Daten"} />
            <Record title="Siegesserie" value={`${data.records.longestWinningStreak} Spiele`} detail="Längste Serie" />
            <Record title="Ungeschlagen" value={`${data.records.longestUnbeatenStreak} Spiele`} detail="Längste Serie" />
          </div>
        </section>

        <section className="club-card p-5 sm:p-6">
          <Header title="Häufigste Gegner" icon={<Shield size={19} />} />
          <div className="mt-5 space-y-3">
            {data.opponentRecords.slice(0, 6).map((row, index) => (
              <div key={row.opponent} className="flex items-center gap-3 rounded-2xl bg-black/25 p-3">
                <span className="text-sm font-black text-club-light-red">{index + 1}</span>
                <p className="min-w-0 flex-1 truncate text-sm font-black text-white">{row.opponent}</p>
                <p className="text-xs text-zinc-500">{row.games} Spiele</p>
                <p className="text-xs font-black text-emerald-300">{row.wins} Siege</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="club-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
          <Header title={`Spielerstatistik ${data.season}`} icon={<Users size={19} />} />
          <Link href="/statistiken" className="club-button-secondary text-xs">
            Öffentliche Ansicht
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left">
            <thead className="bg-white/[0.035] text-[10px] font-black uppercase tracking-wider text-zinc-500">
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
              {data.seasonPlayers.map((player) => (
                <tr key={player.playerId} className="border-t border-white/[0.07]">
                  <td className="px-5 py-4">
                    <Link href={`/team/${player.slug}`} className="flex items-center gap-3">
                      {player.imageUrl ? (
                        <img src={player.imageUrl} alt="" className="h-11 w-11 rounded-xl object-cover object-top" />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-white/[0.05]" />
                      )}
                      <div>
                        <p className="font-black text-white">
                          {player.firstName} {player.lastName}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {player.position} · {player.squad}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <Cell value={player.appearances} />
                  <Cell value={player.starts} />
                  <Cell value={player.goals} highlight />
                  <Cell value={player.assists} />
                  <Cell value={player.yellowCards} />
                  <Cell value={player.redCards} danger />
                  <Cell value={player.minutes} />
                  <Cell value={player.playerOfMatch} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <article className="club-card p-5">
      <div className="club-icon-box">{icon}</div>
      <p className="mt-5 text-3xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">{label}</p>
    </article>
  );
}

function Leader({
  title,
  icon,
  player,
  valueKey,
}: {
  title: string;
  icon: React.ReactNode;
  player: Awaited<ReturnType<typeof getClubStatisticsPro>>["seasonPlayers"][number] | undefined;
  valueKey: "goals" | "assists" | "appearances";
}) {
  return (
    <article className="club-card p-5">
      <div className="club-icon-box">{icon}</div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">{title}</p>
      <p className="mt-2 truncate text-lg font-black text-white">
        {player ? `${player.firstName} ${player.lastName}` : "Noch keine Daten"}
      </p>
      <p className="mt-3 text-3xl font-black text-club-light-red">{player?.[valueKey] ?? 0}</p>
    </article>
  );
}

function Header({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="club-icon-box">{icon}</div>
      <h2 className="text-xl font-black uppercase text-white">{title}</h2>
    </div>
  );
}

function Record({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">{title}</p>
      <p className="mt-2 text-xl font-black text-club-light-red">{value}</p>
      <p className="mt-2 line-clamp-2 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

function Cell({
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
        danger ? "text-red-400" : highlight ? "text-club-light-red" : "text-zinc-300"
      }`}
    >
      {value}
    </td>
  );
}
