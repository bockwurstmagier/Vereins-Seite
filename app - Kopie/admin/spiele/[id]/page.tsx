import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { createClient } from "../../../../lib/supabase/server";
import { updateMatch } from "../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditMatchPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: match, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !match) {
    notFound();
  }

  const matchDate = new Date(match.match_date);

  const dateValue = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(matchDate);

  const timeValue = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Berlin",
  }).format(matchDate);

  return (
    <div className="mx-auto max-w-4xl">
      <a
        href="/admin/spiele"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Zurück zu den Spielen
      </a>

      <p className="club-eyebrow mt-8">Spielverwaltung</p>
      <h1 className="club-heading mt-2">Spiel bearbeiten</h1>

      <form
        action={updateMatch}
        className="club-card mt-8 grid gap-4 p-5 md:grid-cols-2 md:p-6"
      >
        <input type="hidden" name="id" value={match.id} />

        <Field label="Wettbewerb">
          <input
            name="competition"
            required
            defaultValue={match.competition}
            className="admin-input"
          />
        </Field>

        <Field label="Spieltag">
          <input
            name="matchday"
            defaultValue={match.matchday ?? ""}
            placeholder="z. B. 1. Spieltag"
            className="admin-input"
          />
        </Field>

        <Field label="Heimteam">
          <input
            name="home_team"
            required
            defaultValue={match.home_team}
            className="admin-input"
          />
        </Field>

        <Field label="Gastteam">
          <input
            name="away_team"
            required
            defaultValue={match.away_team}
            className="admin-input"
          />
        </Field>

        <Field label="Datum">
          <input
            name="date"
            type="date"
            required
            defaultValue={dateValue}
            className="admin-input"
          />
        </Field>

        <Field label="Uhrzeit">
          <input
            name="time"
            type="time"
            required
            defaultValue={timeValue}
            className="admin-input"
          />
        </Field>

        <Field label="Spielort" className="md:col-span-2">
          <input
            name="location"
            required
            defaultValue={match.location ?? ""}
            className="admin-input"
          />
        </Field>

        <Field label="Google-Maps-Suche" className="md:col-span-2">
          <input
            name="maps_query"
            defaultValue={match.maps_query ?? ""}
            className="admin-input"
          />
        </Field>

        <Field label="Status">
          <select
            name="status"
            defaultValue={match.status}
            className="admin-input"
          >
            <option value="scheduled">Geplant</option>
            <option value="live">Live</option>
            <option value="finished">Beendet</option>
          </select>
        </Field>

        <div />

        <Field label="Tore Heimteam">
          <input
            name="home_score"
            type="number"
            min="0"
            defaultValue={match.home_score ?? ""}
            className="admin-input"
          />
        </Field>

        <Field label="Tore Gastteam">
          <input
            name="away_score"
            type="number"
            min="0"
            defaultValue={match.away_score ?? ""}
            className="admin-input"
          />
        </Field>

        <Field label="Torschützen" className="md:col-span-2">
          <textarea
            name="scorers"
            rows={6}
            defaultValue={(match.scorers ?? []).join("\n")}
            placeholder={"Ein Torschütze pro Zeile\nMax Mustermann 24.'"}
            className="admin-input min-h-36 py-4"
          />
        </Field>

        <div className="md:col-span-2">
          <button type="submit" className="club-button-primary w-full">
            <Save size={18} aria-hidden="true" />
            Änderungen speichern
          </button>
        </div>
      </form>
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
