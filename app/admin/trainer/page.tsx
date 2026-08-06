import Link from "next/link";
import {
  Activity,
  CalendarDays,
  Clock3,
  Goal,
  HeartPulse,
  Medal,
  Plus,
  ShieldAlert,
  Trophy,
  UserRoundCheck,
  Users,
} from "lucide-react";

import { requireRole } from "../../../lib/auth/roles";
import { getTrainerCockpitData } from "../../../lib/trainer-cockpit";
import { createTrainingSession, saveAvailability } from "./actions";

type PageProps = {
  searchParams: Promise<{ season?: string; availability?: string }>;
};

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
  const { season, availability } = await searchParams;
  const data = await getTrainerCockpitData(season);

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="club-eyebrow">Sportliche Leitung</p>
          <h1 className="club-heading mt-2">Trainercockpit Pro</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Spielplanung, Trainingsanwesenheit, Belastung, Verletzungen,
            Sperren und Saisonleistung an einem Ort.
          </p>
        </div>

        <form method="get">
          <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">
            Saison
          </label>
          <select
            name="season"
            defaultValue={data.selectedSeason}
            className="admin-input mt-2 min-w-40"
          >
            {data.seasons.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button type="submit" className="sr-only">
            Saison laden
          </button>
        </form>
      </div>

      {availability && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-200">
          Spielerstatus wurde aktualisiert.
        </div>
      )}

      <section className="mt-7 grid grid-cols-2 gap-4 xl:grid-cols-6">
        <StatCard icon={<Users size={19} />} label="Aktive Spieler" value={data.activePlayers} />
        <StatCard icon={<Trophy size={19} />} label="Spiele" value={data.record.games} />
        <StatCard icon={<Medal size={19} />} label="Siege" value={data.record.wins} />
        <StatCard icon={<UserRoundCheck size={19} />} label="Remis" value={data.record.draws} />
        <StatCard icon={<ShieldAlert size={19} />} label="Niederlagen" value={data.record.losses} />
        <StatCard
          icon={<HeartPulse size={19} />}
          label="Nicht verfügbar"
          value={data.unavailablePlayers.length}
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="club-card p-5 sm:p-6">
          <Header icon={<CalendarDays size={19} />} eyebrow="Planung" title="Kommende Spiele" />
          <div className="mt-5 space-y-3">
            {data.upcoming.length ? (
              data.upcoming.map((match) => (
                <Link
                  key={match.id}
                  href={`/admin/live/${match.id}`}
                  className="block rounded-3xl border border-white/[0.08] bg-black/25 p-4 transition hover:border-club-light-red/25"
                >
                  <p className="text-[9px] font-black uppercase tracking-wider text-club-light-red">
                    {match.competition}
                  </p>
                  <h3 className="mt-2 text-sm font-black text-white">
                    {match.home_team}
                    <span className="mx-2 text-club-light-red">vs.</span>
                    {match.away_team}
                  </h3>
                  <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                    <Clock3 size={14} className="text-club-light-red" />
                    {dateFormatter.format(new Date(match.match_date))}
                  </p>
                </Link>
              ))
            ) : (
              <Empty text="Keine kommenden Spiele eingetragen." />
            )}
          </div>
        </section>

        <section className="club-card p-5 sm:p-6">
          <Header icon={<Goal size={19} />} eyebrow="Leistung" title="Top-Torschützen" />
          <Ranking
            rows={data.topScorers.map((stat) => ({
              id: stat.playerId,
              name: `${stat.firstName} ${stat.lastName}`,
              value: `${stat.goals} Tore`,
              detail: `${stat.assists} Vorlagen`,
            }))}
          />
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="club-card p-5 sm:p-6">
          <Header icon={<Plus size={19} />} eyebrow="Training" title="Einheit anlegen" />
          <form action={createTrainingSession} className="mt-5 grid gap-4 sm:grid-cols-2">
            <input name="title" placeholder="Training" className="admin-input sm:col-span-2" />
            <input name="session_date" type="datetime-local" required className="admin-input sm:col-span-2" />
            <input name="location" placeholder="Trainingsort" className="admin-input" />
            <input name="focus" placeholder="Schwerpunkt" className="admin-input" />
            <select name="intensity" defaultValue="3" className="admin-input">
              <option value="1">Intensität 1 – locker</option>
              <option value="2">Intensität 2</option>
              <option value="3">Intensität 3 – normal</option>
              <option value="4">Intensität 4</option>
              <option value="5">Intensität 5 – sehr hoch</option>
            </select>
            <input
              name="duration_minutes"
              type="number"
              min="1"
              max="300"
              defaultValue="90"
              className="admin-input"
            />
            <textarea
              name="notes"
              placeholder="Notizen zur Einheit"
              className="admin-input min-h-24 py-3 sm:col-span-2"
            />
            <button className="club-button-primary sm:col-span-2">
              <Plus size={17} />
              Training anlegen
            </button>
          </form>
        </section>

        <section className="club-card p-5 sm:p-6">
          <Header icon={<Activity size={19} />} eyebrow="Training" title="Letzte Einheiten" />
          <div className="mt-5 space-y-3">
            {data.sessions.length ? (
              data.sessions.slice(0, 8).map((session) => (
                <Link
                  key={session.id}
                  href={`/admin/trainer/training/${session.id}`}
                  className="flex items-center gap-4 rounded-3xl border border-white/[0.08] bg-black/25 p-4 transition hover:border-club-light-red/25"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-club-red/10 text-club-light-red">
                    <Activity size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-white">{session.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {dateFormatter.format(new Date(session.session_date))}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                      {session.focus || "Ohne Schwerpunkt"} · {session.duration_minutes} Min. · Intensität {session.intensity}/5
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <Empty text="Noch keine Trainingseinheit angelegt." />
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="club-card p-5 sm:p-6">
          <Header icon={<HeartPulse size={19} />} eyebrow="Kaderstatus" title="Verfügbarkeit" />
          <div className="mt-5 space-y-3">
            {data.players.map((player) => {
              const current = data.availability.find((entry) => entry.player_id === player.id);
              return (
                <form
                  key={player.id}
                  action={saveAvailability}
                  className="grid gap-3 rounded-3xl border border-white/[0.08] bg-black/25 p-4 sm:grid-cols-[1fr_11rem]"
                >
                  <input type="hidden" name="player_id" value={player.id} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {player.position}
                      {player.shirt_number ? ` · Nr. ${player.shirt_number}` : ""}
                    </p>
                    {current && (
                      <p className="mt-2 text-xs font-bold text-amber-300">
                        Aktuell: {statusLabel(current.status)}
                        {current.reason ? ` – ${current.reason}` : ""}
                      </p>
                    )}
                  </div>
                  <select name="status" defaultValue={current?.status ?? "fit"} className="admin-input">
                    <option value="fit">Fit</option>
                    <option value="questionable">Fraglich</option>
                    <option value="injured">Verletzt</option>
                    <option value="rehab">Reha</option>
                    <option value="suspended">Gesperrt</option>
                    <option value="unavailable">Nicht verfügbar</option>
                  </select>
                  <input name="reason" placeholder="Grund" defaultValue={current?.reason ?? ""} className="admin-input sm:col-span-2" />
                  <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                    <input name="start_date" type="date" defaultValue={current?.start_date ?? new Date().toISOString().slice(0, 10)} className="admin-input" />
                    <input name="end_date" type="date" defaultValue={current?.end_date ?? ""} className="admin-input" />
                  </div>
                  <textarea name="note" placeholder="Interne Notiz" defaultValue={current?.note ?? ""} className="admin-input min-h-20 py-3 sm:col-span-2" />
                  <button className="club-button-secondary sm:col-span-2">
                    Status speichern
                  </button>
                </form>
              );
            })}
          </div>
        </section>

        <section className="club-card p-5 sm:p-6">
          <Header icon={<UserRoundCheck size={19} />} eyebrow="Training" title="Anwesenheitsquote" />
          <Ranking
            rows={data.attendanceLeaders.map((entry) => ({
              id: entry.playerId,
              name: entry.name,
              value: `${entry.rate}%`,
              detail: `${entry.attended} von ${entry.counted} Einheiten`,
            }))}
          />

          <div className="mt-8">
            <Header icon={<ShieldAlert size={19} />} eyebrow="Ausfälle" title="Aktuelle Meldungen" />
            <div className="mt-5 space-y-3">
              {data.unavailablePlayers.length ? (
                data.unavailablePlayers.map((entry) => {
                  const player = data.players.find((item) => item.id === entry.player_id);
                  return (
                    <div key={entry.id} className="rounded-3xl border border-amber-500/15 bg-amber-950/15 p-4">
                      <p className="text-sm font-black text-white">
                        {player ? `${player.first_name} ${player.last_name}` : "Spieler"}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-amber-300">
                        {statusLabel(entry.status)}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-zinc-500">
                        {entry.reason || entry.note || "Kein weiterer Hinweis."}
                      </p>
                    </div>
                  );
                })
              ) : (
                <Empty text="Aktuell sind alle Spieler als fit gemeldet." />
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="club-card p-5 sm:p-6">
          <Header icon={<UserRoundCheck size={19} />} eyebrow="Kader" title="Meiste Einsätze" />
          <Ranking
            rows={data.mostAppearances.map((stat) => ({
              id: stat.playerId,
              name: `${stat.firstName} ${stat.lastName}`,
              value: `${stat.appearances} Einsätze`,
              detail: `${stat.minutes} Minuten`,
            }))}
          />
        </section>

        <section className="club-card p-5 sm:p-6">
          <Header icon={<ShieldAlert size={19} />} eyebrow="Disziplin" title="Kartenübersicht" />
          <Ranking
            rows={data.cardLeaders.map((stat) => ({
              id: stat.playerId,
              name: `${stat.firstName} ${stat.lastName}`,
              value: `${stat.yellowCards} Gelb`,
              detail: `${stat.redCards} Rot`,
            }))}
          />
        </section>
      </div>
    </div>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    fit: "Fit",
    questionable: "Fraglich",
    injured: "Verletzt",
    suspended: "Gesperrt",
    unavailable: "Nicht verfügbar",
    rehab: "Reha",
  };
  return labels[status] ?? status;
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <article className="club-card p-5">
      <div className="club-icon-box">{icon}</div>
      <p className="mt-5 text-3xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </article>
  );
}

function Header({
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
        <h2 className="mt-1 text-xl font-black uppercase text-white">{title}</h2>
      </div>
    </div>
  );
}

function Ranking({
  rows,
}: {
  rows: Array<{ id: string; name: string; value: string; detail: string }>;
}) {
  return (
    <div className="mt-5 space-y-3">
      {rows.length ? (
        rows.map((row, index) => (
          <div
            key={row.id}
            className="flex items-center gap-3 rounded-3xl border border-white/[0.08] bg-black/25 p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-club-red/10 text-sm font-black text-club-light-red">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">{row.name}</p>
              <p className="mt-1 text-xs text-zinc-600">{row.detail}</p>
            </div>
            <p className="text-xs font-black text-club-light-red">{row.value}</p>
          </div>
        ))
      ) : (
        <Empty text="Noch keine Statistikdaten vorhanden." />
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}
