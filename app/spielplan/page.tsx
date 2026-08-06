import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { getMatches } from "../../lib/sport-center";

type SearchParams = Promise<{
  status?: string;
  competition?: string;
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

export const metadata = {
  title: "Spielplan | SpVgg Middelich-Resse",
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const allMatches = await getMatches();
  const competitions = [...new Set(allMatches.map((match) => match.competition))];
  const matches = allMatches.filter((match) => {
    const statusMatch = !params.status || params.status === match.status;
    const competitionMatch =
      !params.competition || params.competition === match.competition;
    return statusMatch && competitionMatch;
  });

  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="club-eyebrow">
          Zurück zur Startseite
        </a>
        <h1 className="club-heading mt-4">Spielplan & Ergebnisse</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Alle eingetragenen Liga-, Pokal- und Testspiele in einer Übersicht.
          Offizielle Termine findest du zusätzlich im FUSSBALL.DE-Bereich.
        </p>

        <form className="club-card mt-8 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto]">
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="admin-input"
          >
            <option value="">Alle Spielstände</option>
            <option value="scheduled">Geplant</option>
            <option value="live">Live</option>
            <option value="finished">Beendet</option>
          </select>
          <select
            name="competition"
            defaultValue={params.competition ?? ""}
            className="admin-input"
          >
            <option value="">Alle Wettbewerbe</option>
            {competitions.map((competition) => (
              <option key={competition} value={competition}>
                {competition}
              </option>
            ))}
          </select>
          <button className="club-button-primary">Filtern</button>
        </form>

        <div className="mt-6 space-y-4">
          {!matches.length ? (
            <div className="club-card p-6 text-sm text-zinc-400">
              Für diesen Filter wurden keine Spiele gefunden.
            </div>
          ) : (
            matches.map((match) => {
              const matchDate = new Date(match.match_date);
              const finished = match.status === "finished";

              return (
                <article key={match.id} className="club-card p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-club-light-red/25 bg-club-red/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-club-light-red">
                        {match.competition}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                        {match.matchday || "Spiel"}
                      </span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                      {match.status === "scheduled"
                        ? "Geplant"
                        : match.status === "live"
                          ? "Live"
                          : "Beendet"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                    <TeamName
                      name={match.home_team}
                      logoUrl={match.home_logo_url}
                    />
                    <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                      <p className="text-2xl font-black tabular-nums">
                        {finished
                          ? `${match.home_score ?? 0}:${match.away_score ?? 0}`
                          : "VS"}
                      </p>
                    </div>
                    <TeamName
                      name={match.away_team}
                      logoUrl={match.away_logo_url}
                    />
                  </div>

                  <div className="mt-5 grid gap-2 text-xs text-zinc-400 sm:grid-cols-3">
                    <Info
                      icon={<CalendarDays size={15} />}
                      text={dateFormatter.format(matchDate)}
                    />
                    <Info
                      icon={<Clock3 size={15} />}
                      text={`${timeFormatter.format(matchDate)} Uhr`}
                    />
                    <Info
                      icon={<MapPin size={15} />}
                      text={match.location || "Spielort folgt"}
                    />
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl bg-black/25 px-3 py-3 sm:justify-start">
      <span className="text-club-light-red">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}


function TeamName({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="min-w-0 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white p-2">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`Logo von ${name}`}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-[9px] font-black text-zinc-500">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-black leading-tight sm:text-base">
        {name}
      </p>
    </div>
  );
}
