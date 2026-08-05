import {
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Trophy,
} from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { createMatch, deleteMatch } from "./actions";

type SearchParams = Promise<{
  created?: string;
  deleted?: string;
  updated?: string;
}>;

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

export default async function MatchesAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      "id, competition, matchday, home_team, away_team, match_date, location, status, home_score, away_score",
    )
    .order("match_date", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="club-eyebrow">Vereinsmanager</p>
          <h1 className="club-heading mt-2">Spiele verwalten</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Lege neue Spiele an, ändere Termine und trage später Ergebnisse und
            Torschützen ein.
          </p>
        </div>

        <a href="#new-match" className="club-button-primary">
          <Plus size={18} aria-hidden="true" />
          Neues Spiel
        </a>
      </div>

      {params.created && (
        <Notice text="Das Spiel wurde erfolgreich gespeichert." />
      )}

      {params.updated && (
        <Notice text="Das Spiel wurde erfolgreich aktualisiert." />
      )}

      {params.deleted && (
        <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          Das Spiel wurde gelöscht.
        </div>
      )}

      <section id="new-match" className="club-card mt-8 scroll-mt-24 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="club-icon-box">
            <CalendarDays size={19} aria-hidden="true" />
          </div>

          <div>
            <p className="club-eyebrow">Neuer Eintrag</p>
            <h2 className="mt-1 text-xl font-black uppercase text-white">
              Spiel anlegen
            </h2>
          </div>
        </div>

        <form action={createMatch} className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Wettbewerb">
            <input
              name="competition"
              required
              defaultValue="Kreisliga"
              className="admin-input"
            />
          </Field>

          <Field label="Spieltag">
            <input
              name="matchday"
              placeholder="z. B. 1. Spieltag"
              className="admin-input"
            />
          </Field>

          <Field label="Heimteam">
            <input
              name="home_team"
              required
              defaultValue="SpVgg Middelich-Resse"
              className="admin-input"
            />
          </Field>

          <Field label="Gastteam">
            <input
              name="away_team"
              required
              placeholder="Name des Gegners"
              className="admin-input"
            />
          </Field>

          <Field label="Datum">
            <input name="date" type="date" required className="admin-input" />
          </Field>

          <Field label="Uhrzeit">
            <input name="time" type="time" required className="admin-input" />
          </Field>

          <Field label="Spielort" className="md:col-span-2">
            <input
              name="location"
              required
              placeholder="Kanzlerstraße 44, 45883 Gelsenkirchen"
              className="admin-input"
            />
          </Field>

          <Field label="Google-Maps-Suche" className="md:col-span-2">
            <input
              name="maps_query"
              placeholder="Kann leer bleiben – dann wird der Spielort verwendet"
              className="admin-input"
            />
          </Field>

          <Field label="Status">
            <select name="status" defaultValue="scheduled" className="admin-input">
              <option value="scheduled">Geplant</option>
              <option value="live">Live</option>
              <option value="finished">Beendet</option>
            </select>
          </Field>

          <div className="flex items-end">
            <button type="submit" className="club-button-primary w-full">
              <Plus size={18} aria-hidden="true" />
              Spiel speichern
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="club-icon-box">
            <Trophy size={19} aria-hidden="true" />
          </div>

          <div>
            <p className="club-eyebrow">Datenbank</p>
            <h2 className="mt-1 text-xl font-black uppercase text-white">
              Eingetragene Spiele
            </h2>
          </div>
        </div>

        {error ? (
          <div className="club-card p-5 text-sm text-red-300">
            Spiele konnten nicht geladen werden: {error.message}
          </div>
        ) : !matches?.length ? (
          <div className="club-card p-6 text-sm text-zinc-400">
            Noch keine Spiele eingetragen.
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const matchDate = new Date(match.match_date);
              const hasResult =
                match.home_score !== null && match.away_score !== null;

              return (
                <article key={match.id} className="club-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-club-light-red/25 bg-club-red/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-club-light-red">
                          {match.competition}
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          {match.matchday || "Spieltag"}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                          {getStatusLabel(match.status)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-black leading-tight text-white">
                        {match.home_team}
                        <span className="mx-2 text-club-light-red">
                          {hasResult
                            ? `${match.home_score}:${match.away_score}`
                            : "vs."}
                        </span>
                        {match.away_team}
                      </h3>

                      <div className="mt-4 space-y-2 text-sm text-zinc-400">
                        <Info
                          icon={<CalendarDays size={16} aria-hidden="true" />}
                          text={dateFormatter.format(matchDate)}
                        />
                        <Info
                          icon={<Clock3 size={16} aria-hidden="true" />}
                          text={`${timeFormatter.format(matchDate)} Uhr`}
                        />
                        <Info
                          icon={<MapPin size={16} aria-hidden="true" />}
                          text={match.location || "Kein Spielort"}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`/admin/spiele/${match.id}`}
                        aria-label="Spiel bearbeiten"
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-zinc-300 transition hover:border-club-light-red/30 hover:text-white active:scale-95"
                      >
                        <Pencil size={18} aria-hidden="true" />
                      </a>

                      <form action={deleteMatch}>
                        <input type="hidden" name="id" value={match.id} />

                        <button
                          type="submit"
                          aria-label="Spiel löschen"
                          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400 transition hover:bg-red-900/40 active:scale-95"
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
      {text}
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Info({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-club-light-red">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function getStatusLabel(status: string) {
  if (status === "live") return "Live";
  if (status === "finished") return "Beendet";
  return "Geplant";
}
