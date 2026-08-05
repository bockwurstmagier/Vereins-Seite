import {
  CalendarDays,
  Clock3,
  Goal,
  Medal,
  ShieldAlert,
  Trophy,
  UserRoundCheck,
  Users,
} from "lucide-react";

import { requireRole } from "../../../lib/auth/roles";
import { getTrainerCockpitData } from "../../../lib/trainer-cockpit";

type PageProps = { searchParams: Promise<{ season?: string }> };

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default async function TrainerCockpitPage({ searchParams }: PageProps) {
  await requireRole(["administrator", "trainer", "betreuer"]);
  const { season } = await searchParams;
  const data = await getTrainerCockpitData(season);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="club-eyebrow">Sportliche Leitung</p>
          <h1 className="club-heading mt-2">Trainercockpit</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Kommende Spiele, Saisonbilanz, Einsatzzeiten, Torschützen und Karten auf einen Blick.</p>
        </div>
        <form method="get">
          <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Saison</label>
          <select name="season" defaultValue={data.selectedSeason} className="admin-input mt-2 min-w-40" onChange={undefined}>
            {data.seasons.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button type="submit" className="sr-only">Saison laden</button>
        </form>
      </div>

      <section className="mt-7 grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard icon={<Users size={19} />} label="Aktive Spieler" value={data.activePlayers} />
        <StatCard icon={<Trophy size={19} />} label="Spiele" value={data.record.games} />
        <StatCard icon={<Medal size={19} />} label="Siege" value={data.record.wins} />
        <StatCard icon={<UserRoundCheck size={19} />} label="Remis" value={data.record.draws} />
        <StatCard icon={<ShieldAlert size={19} />} label="Niederlagen" value={data.record.losses} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="club-card p-5 sm:p-6">
          <Header icon={<CalendarDays size={19} />} eyebrow="Planung" title="Kommende Spiele" />
          <div className="mt-5 space-y-3">
            {data.upcoming.length ? data.upcoming.map((match) => (
              <a key={match.id} href={`/admin/live/${match.id}`} className="block rounded-3xl border border-white/[0.08] bg-black/25 p-4 transition hover:border-club-light-red/25">
                <p className="text-[9px] font-black uppercase tracking-wider text-club-light-red">{match.competition}</p>
                <h3 className="mt-2 text-sm font-black text-white">{match.home_team}<span className="mx-2 text-club-light-red">vs.</span>{match.away_team}</h3>
                <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500"><Clock3 size={14} className="text-club-light-red" />{dateFormatter.format(new Date(match.match_date))}</p>
              </a>
            )) : <Empty text="Keine kommenden Spiele eingetragen." />}
          </div>
        </section>

        <section className="club-card p-5 sm:p-6">
          <Header icon={<Goal size={19} />} eyebrow="Leistung" title="Top-Torschützen" />
          <Ranking rows={data.topScorers.map((stat) => ({ id: stat.playerId, name: `${stat.firstName} ${stat.lastName}`, value: `${stat.goals} Tore`, detail: `${stat.assists} Vorlagen` }))} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="club-card p-5 sm:p-6">
          <Header icon={<UserRoundCheck size={19} />} eyebrow="Kader" title="Meiste Einsätze" />
          <Ranking rows={data.mostAppearances.map((stat) => ({ id: stat.playerId, name: `${stat.firstName} ${stat.lastName}`, value: `${stat.appearances} Einsätze`, detail: `${stat.minutes} Minuten` }))} />
        </section>

        <section className="club-card p-5 sm:p-6">
          <Header icon={<ShieldAlert size={19} />} eyebrow="Disziplin" title="Kartenübersicht" />
          <Ranking rows={data.cardLeaders.map((stat) => ({ id: stat.playerId, name: `${stat.firstName} ${stat.lastName}`, value: `${stat.yellowCards} Gelb`, detail: `${stat.redCards} Rot` }))} />
        </section>
      </div>

      <section className="club-card mt-6 p-5 sm:p-6">
        <Header icon={<Trophy size={19} />} eyebrow="Form" title="Letzte Ergebnisse" />
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {data.recent.length ? data.recent.map((match) => (
            <article key={match.id} className="rounded-3xl border border-white/[0.08] bg-black/25 p-4 text-center">
              <p className="text-xs font-black leading-tight text-zinc-300">{match.home_team}</p>
              <p className="my-3 text-2xl font-black tabular-nums text-white">{match.home_score ?? 0}<span className="mx-1 text-club-light-red">:</span>{match.away_score ?? 0}</p>
              <p className="text-xs font-black leading-tight text-zinc-300">{match.away_team}</p>
            </article>
          )) : <div className="md:col-span-2 xl:col-span-5"><Empty text="Keine beendeten Spiele in dieser Saison." /></div>}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <article className="club-card p-5"><div className="club-icon-box">{icon}</div><p className="mt-5 text-3xl font-black tabular-nums text-white">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">{label}</p></article>;
}

function Header({ icon, eyebrow, title }: { icon: React.ReactNode; eyebrow: string; title: string }) {
  return <div className="flex items-center gap-3"><div className="club-icon-box">{icon}</div><div><p className="club-eyebrow">{eyebrow}</p><h2 className="mt-1 text-xl font-black uppercase text-white">{title}</h2></div></div>;
}

function Ranking({ rows }: { rows: Array<{ id: string; name: string; value: string; detail: string }> }) {
  return <div className="mt-5 space-y-3">{rows.length ? rows.map((row, index) => <div key={row.id} className="flex items-center gap-3 rounded-3xl border border-white/[0.08] bg-black/25 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-club-red/10 text-sm font-black text-club-light-red">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-white">{row.name}</p><p className="mt-1 text-xs text-zinc-600">{row.detail}</p></div><p className="text-xs font-black text-club-light-red">{row.value}</p></div>) : <Empty text="Noch keine Statistikdaten vorhanden." />}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">{text}</div>;
}
