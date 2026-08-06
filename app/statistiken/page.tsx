import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Award,
  BarChart3,
  Goal,
  Home,
  Medal,
  Percent,
  Plane,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import { getClubStatisticsPro } from "../../lib/club-statistics-pro";

export const metadata = {
  title: "Vereinsstatistik Pro | SpVgg Middelich-Resse",
};

type PageProps = {
  searchParams: Promise<{ season?: string }>;
};

const formatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default async function StatisticsPage({ searchParams }: PageProps) {
  const { season } = await searchParams;
  const data = await getClubStatisticsPro(season);
  const overview = data.overview;

  const cards = [
    ["Spiele", overview.played, Trophy],
    ["Siege", overview.wins, Award],
    ["Unentschieden", overview.draws, Shield],
    ["Niederlagen", overview.losses, Activity],
    ["Tore", overview.goalsFor, Goal],
    ["Tordifferenz", signed(overview.goalDifference), Target],
    ["Punkte", overview.points, Medal],
    ["Siegquote", `${overview.winRate}%`, Percent],
  ] as const;

  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="club-eyebrow">
              Zurück zur Startseite
            </Link>
            <h1 className="club-heading mt-4">Vereinsstatistik Pro</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
              Saisonwerte, Spieler-Rankings, Vereinsrekorde und die komplette
              Bilanz gegen alle Gegner – automatisch aus dem Match-Center.
            </p>
          </div>

          <form method="get">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
              Saison
            </label>
            <select
              name="season"
              defaultValue={data.season}
              className="admin-input mt-2 min-w-40"
            >
              {data.seasons.map((entry) => (
                <option key={entry}>{entry}</option>
              ))}
            </select>
            <button type="submit" className="club-button-secondary mt-2 w-full">
              Anzeigen
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <article key={label} className="club-card p-5">
              <div className="club-icon-box">
                <Icon size={19} />
              </div>
              <p className="mt-5 text-3xl font-black tabular-nums">{value}</p>
              <p className="mt-1 text-xs font-black uppercase tracking-wider text-zinc-500">
                {label}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="club-card p-5 sm:p-6">
            <Header eyebrow="Formkurve" title="Letzte Spiele" icon={<BarChart3 size={19} />} />
            <div className="mt-6 flex flex-wrap gap-3">
              {data.form.length ? (
                data.form.map((entry) => (
                  <div
                    key={`${entry.date}-${entry.opponent}`}
                    className="min-w-24 rounded-2xl border border-white/10 bg-black/25 p-3 text-center"
                  >
                    <span
                      className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl font-black ${
                        entry.result === "W"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : entry.result === "D"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {entry.result}
                    </span>
                    <p className="mt-2 truncate text-[10px] font-black text-white">
                      {entry.opponent}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{entry.score}</p>
                  </div>
                ))
              ) : (
                <Empty text="Noch keine Ergebnisse in dieser Saison." />
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat
                icon={<Home size={17} />}
                label="Heimbilanz"
                value={`${overview.home.wins}/${overview.home.played} Siege`}
                detail={`${overview.home.goalsFor}:${overview.home.goalsAgainst} Tore`}
              />
              <MiniStat
                icon={<Plane size={17} />}
                label="Auswärtsbilanz"
                value={`${overview.away.wins}/${overview.away.played} Siege`}
                detail={`${overview.away.goalsFor}:${overview.away.goalsAgainst} Tore`}
              />
            </div>
          </section>

          <section className="club-card p-5 sm:p-6">
            <Header eyebrow="Saison" title="Top-Torschützen" icon={<Goal size={19} />} />
            <Ranking
              rows={data.seasonPlayers
                .slice()
                .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
                .slice(0, 7)
                .map((player) => ({
                  id: player.playerId,
                  name: `${player.firstName} ${player.lastName}`,
                  imageUrl: player.imageUrl,
                  value: `${player.goals} Tore`,
                  detail: `${player.assists} Vorlagen`,
                  href: `/team/${player.slug}`,
                }))}
            />
          </section>
        </div>

        <section className="club-card mt-6 p-5 sm:p-6">
          <Header eyebrow="Vereinsrekorde" title="Bestmarken" icon={<Sparkles size={19} />} />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <RecordCard
              title="Höchster Sieg"
              value={data.records.biggestWin?.score ?? "–"}
              detail={data.records.biggestWin?.label ?? "Noch keine Daten"}
            />
            <RecordCard
              title="Höchste Niederlage"
              value={data.records.biggestLoss?.score ?? "–"}
              detail={data.records.biggestLoss?.label ?? "Noch keine Daten"}
            />
            <RecordCard
              title="Torreichstes Spiel"
              value={data.records.highestScoring?.score ?? "–"}
              detail={data.records.highestScoring?.label ?? "Noch keine Daten"}
            />
            <RecordCard
              title="Schnellstes Tor"
              value={
                data.records.fastestGoal
                  ? `${data.records.fastestGoal.minute}. Minute`
                  : "–"
              }
              detail={
                data.records.fastestGoal?.player
                  ? `${data.records.fastestGoal.player.first_name} ${data.records.fastestGoal.player.last_name}`
                  : "Noch keine Daten"
              }
            />
            <RecordCard
              title="Längste Siegesserie"
              value={`${data.records.longestWinningStreak} Spiele`}
              detail="Alle erfassten Saisons"
            />
            <RecordCard
              title="Längste Ungeschlagen-Serie"
              value={`${data.records.longestUnbeatenStreak} Spiele`}
              detail="Alle erfassten Saisons"
            />
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="club-card p-5 sm:p-6">
            <Header eyebrow="Vereinsgeschichte" title="Ewige Torjägerliste" icon={<Medal size={19} />} />
            <Ranking
              rows={data.allTime.topScorers.map((player) => ({
                id: player.id,
                name: player.name,
                imageUrl: player.imageUrl,
                value: `${player.goals} Tore`,
                detail: `${player.assists} Vorlagen`,
                href: `/team/${player.slug}`,
              }))}
            />
          </section>

          <section className="club-card p-5 sm:p-6">
            <Header eyebrow="Vereinsgeschichte" title="Ewige Assistliste" icon={<Zap size={19} />} />
            <Ranking
              rows={data.allTime.topAssists.map((player) => ({
                id: player.id,
                name: player.name,
                imageUrl: player.imageUrl,
                value: `${player.assists} Vorlagen`,
                detail: `${player.goals} Tore`,
                href: `/team/${player.slug}`,
              }))}
            />
          </section>
        </div>

        <section className="club-card mt-6 overflow-hidden">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <Header eyebrow="Gegnerbilanz" title="Alle Gegner" icon={<Users size={19} />} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full text-left">
              <thead className="bg-white/[0.035] text-[10px] font-black uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Gegner</th>
                  <th className="px-3 py-4 text-center">Sp.</th>
                  <th className="px-3 py-4 text-center">S</th>
                  <th className="px-3 py-4 text-center">U</th>
                  <th className="px-3 py-4 text-center">N</th>
                  <th className="px-3 py-4 text-center">Tore</th>
                  <th className="px-3 py-4 text-center">Punkte</th>
                  <th className="px-5 py-4 text-right">Zuletzt</th>
                </tr>
              </thead>
              <tbody>
                {data.opponentRecords.map((row) => (
                  <tr key={row.opponent} className="border-t border-white/[0.07]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5">
                          {row.logoUrl ? (
                            <img
                              src={row.logoUrl}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <Shield size={18} className="text-zinc-500" />
                          )}
                        </div>
                        <p className="font-black text-white">{row.opponent}</p>
                      </div>
                    </td>
                    <Cell value={row.games} />
                    <Cell value={row.wins} highlight />
                    <Cell value={row.draws} />
                    <Cell value={row.losses} danger />
                    <Cell value={`${row.goalsFor}:${row.goalsAgainst}`} />
                    <Cell value={row.points} />
                    <td className="px-5 py-4 text-right text-xs text-zinc-500">
                      {formatter.format(new Date(row.lastMatchDate))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 text-xs leading-6 text-zinc-500">
          Die ewigen Spielerlisten basieren auf allen Match-Center-Ereignissen,
          die in der Plattform gespeichert sind. Frühere Spiele ohne erfasste
          Aufstellungen oder Ereignisse können nicht vollständig berücksichtigt
          werden.
        </div>
      </div>
    </main>
  );
}

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function Header({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="club-icon-box">{icon}</div>
      <div>
        <p className="club-eyebrow">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black uppercase text-white">{title}</h2>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="text-club-light-red">{icon}</div>
      <p className="mt-3 text-xl font-black">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-xs text-zinc-600">{detail}</p>
    </div>
  );
}

function Ranking({
  rows,
}: {
  rows: Array<{
    id: string;
    name: string;
    imageUrl: string | null;
    value: string;
    detail: string;
    href: string;
  }>;
}) {
  return (
    <div className="mt-5 space-y-3">
      {rows.length ? (
        rows.map((row, index) => (
          <Link
            key={row.id}
            href={row.href}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/25 p-3 transition hover:border-club-light-red/25"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-club-red/10 text-sm font-black text-club-light-red">
              {index + 1}
            </span>
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
                alt=""
                className="h-11 w-11 rounded-xl object-cover object-top"
              />
            ) : (
              <div className="h-11 w-11 rounded-xl bg-white/[0.05]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">{row.name}</p>
              <p className="mt-1 text-xs text-zinc-600">{row.detail}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-club-light-red">{row.value}</p>
              <ArrowUpRight size={14} className="ml-auto mt-1 text-zinc-700" />
            </div>
          </Link>
        ))
      ) : (
        <Empty text="Noch keine Daten vorhanden." />
      )}
    </div>
  );
}

function RecordCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-3xl border border-white/[0.08] bg-black/25 p-5">
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
        {title}
      </p>
      <p className="mt-3 text-2xl font-black text-club-light-red">{value}</p>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{detail}</p>
    </article>
  );
}

function Cell({
  value,
  highlight = false,
  danger = false,
}: {
  value: string | number;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <td
      className={`px-3 py-4 text-center text-sm font-black tabular-nums ${
        highlight
          ? "text-emerald-300"
          : danger
            ? "text-red-300"
            : "text-zinc-300"
      }`}
    >
      {value}
    </td>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-zinc-500">{text}</p>;
}
