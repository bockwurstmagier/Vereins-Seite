import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Circle,
  Flag,
  Sparkles,
  Pause,
  Play,
  Radio,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import { getPublicMatchCenterMatch } from "../../../../lib/match-center";
import FormationEditor from "../../../../components/match-center/FormationEditor";
import {
  addMatchEvent,
  deleteMatchEvent,
  quickLiveAction,
  updateMatchEvent,
  updateMatchCenter,
} from "../actions";
import { finalizeMatchDay } from "../finalize-actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; event?: string; deleted?: string; corrected?: string; squad?: string; quick?: string; tactics?: string }>;
};

export default async function AdminMatchCenterDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const notices = await searchParams;
  const data = await getPublicMatchCenterMatch(id);

  if (!data) notFound();

  const { match, players, events, squad } = data;
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const starters = new Set(squad.filter((entry) => entry.role === "starter").map((entry) => entry.player_id));
  const bench = new Set(squad.filter((entry) => entry.role === "bench").map((entry) => entry.player_id));

  return (
    <div className="mx-auto max-w-6xl">
      <a href="/admin/match-center" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red">
        <ArrowLeft size={16} aria-hidden="true" />
        Zurück zum Match-Center
      </a>

      <div className="mt-8">
        <p className="club-eyebrow">{match.competition}</p>
        <h1 className="mt-2 text-3xl font-black uppercase leading-tight sm:text-4xl">
          {match.home_team} <span className="text-club-light-red">vs.</span> {match.away_team}
        </h1>
      </div>

      {(notices.saved || notices.event || notices.deleted || notices.corrected || notices.squad || notices.quick || notices.tactics) && (
        <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          Änderungen wurden erfolgreich gespeichert.
        </div>
      )}

      <section className="club-card mt-8 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="club-eyebrow">Handy-Steuerung</p>
            <h2 className="mt-1 text-xl font-black uppercase">Schnellaktionen</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Start, Halbzeit und Abpfiff werden sofort im öffentlichen LiveCenter angezeigt.
            </p>
          </div>
          <a
            href={`/match-center/${match.id}`}
            target="_blank"
            rel="noreferrer"
            className="club-button-secondary"
          >
            <Radio size={17} aria-hidden="true" />
            Liveansicht öffnen
          </a>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <QuickAction
            matchId={match.id}
            action="kickoff"
            label="Anpfiff"
            icon={<Play size={17} aria-hidden="true" />}
          />
          <QuickAction
            matchId={match.id}
            action="halftime"
            label="Halbzeit"
            icon={<Pause size={17} aria-hidden="true" />}
          />
          <QuickAction
            matchId={match.id}
            action="second_half"
            label="2. Halbzeit"
            icon={<Play size={17} aria-hidden="true" />}
          />
          <QuickAction
            matchId={match.id}
            action="fulltime"
            label="Abpfiff"
            icon={<Flag size={17} aria-hidden="true" />}
            danger
          />
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-club-light-red/25 bg-gradient-to-r from-club-burgundy/80 via-club-dark-red/45 to-black p-5 shadow-[0_0_45px_rgba(193,18,31,0.18)] sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="club-eyebrow">Automatisierung</p>
            <h2 className="mt-2 text-2xl font-black uppercase text-white">Ein-Klick-Spieltag</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              Beendet das Spiel, aktualisiert Statistiken, versendet den Abpfiff-Push und erstellt Spielbericht, Social-Texte, News-Entwurf und Ergebnisgrafik.
            </p>
          </div>
          <form action={finalizeMatchDay}>
            <input type="hidden" name="match_id" value={match.id} />
              <input type="hidden" name="publish_report" value="true" />
            <button type="submit" className="club-button-primary min-h-16 w-full px-7 sm:w-auto">
              <Sparkles size={20} /> Spiel beenden & alles erstellen
            </button>
          </form>
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="club-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="club-icon-box"><Radio size={19} aria-hidden="true" /></div>
            <div><p className="club-eyebrow">Steuerung</p><h2 className="mt-1 text-xl font-black uppercase">Spielstatus</h2></div>
          </div>

          <form action={updateMatchCenter} className="mt-6 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="match_id" value={match.id} />
            <Field label="Status">
              <select name="status" defaultValue={match.status} className="admin-input">
                <option value="scheduled">Geplant</option>
                <option value="live">Live</option>
                <option value="finished">Beendet</option>
              </select>
            </Field>
            <Field label="Spielminute">
              <input name="current_minute" type="number" min="0" max="130" defaultValue={match.current_minute} className="admin-input" />
            </Field>
            <Field label="Tore Heimteam">
              <input name="home_score" type="number" min="0" defaultValue={match.home_score ?? 0} className="admin-input" />
            </Field>
            <Field label="Tore Gastteam">
              <input name="away_score" type="number" min="0" defaultValue={match.away_score ?? 0} className="admin-input" />
            </Field>
            <Field label="Spieler des Spiels" className="sm:col-span-2">
              <select name="player_of_match_id" defaultValue={match.player_of_match_id ?? ""} className="admin-input">
                <option value="">Noch nicht gewählt</option>
                {players.map((player) => <option key={player.id} value={player.id}>{player.first_name} {player.last_name}</option>)}
              </select>
            </Field>
            <Field label="Spielbericht" className="sm:col-span-2">
              <textarea name="report" rows={8} defaultValue={match.report ?? ""} className="admin-input min-h-48 py-4" placeholder="Spielverlauf und Fazit …" />
            </Field>
            <div className="sm:col-span-2">
              <button type="submit" className="club-button-primary w-full"><Save size={18} aria-hidden="true" /> Match-Center speichern</button>
            </div>
          </form>
        </section>

        <section className="club-card relative z-40 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="club-icon-box"><Circle size={19} aria-hidden="true" /></div>
            <div><p className="club-eyebrow">Live-Ticker</p><h2 className="mt-1 text-xl font-black uppercase">Ereignis hinzufügen</h2></div>
          </div>

          <form action={addMatchEvent} className="mt-6 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="match_id" value={match.id} />
            <Field label="Ereignis">
              <select name="event_type" defaultValue="goal" className="admin-input">
                <option value="goal">Tor</option>
                <option value="yellow_card">Gelbe Karte</option>
                <option value="red_card">Rote Karte</option>
                <option value="substitution">Auswechslung</option>
                <option value="note">Notiz</option>
              </select>
            </Field>
            <Field label="Minute">
              <input name="minute" type="number" min="0" max="130" defaultValue={match.current_minute} className="admin-input" />
            </Field>
            <Field label="Spieler">
              <select name="player_id" defaultValue="" className="admin-input">
                <option value="">Kein Spieler</option>
                {players.map((player) => <option key={player.id} value={player.id}>{player.first_name} {player.last_name}</option>)}
              </select>
            </Field>
            <Field label="Zweiter Spieler">
              <select name="secondary_player_id" defaultValue="" className="admin-input">
                <option value="">Nur bei Auswechslung</option>
                {players.map((player) => <option key={player.id} value={player.id}>{player.first_name} {player.last_name}</option>)}
              </select>
            </Field>
            <Field label="Beschreibung" className="sm:col-span-2">
              <input name="description" className="admin-input" placeholder="z. B. Kopfball nach Ecke" />
            </Field>
            <div className="sm:col-span-2">
              <button type="submit" className="club-button-primary w-full">Ereignis speichern</button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            {events.length ? events.map((event) => {
              const player = event.player_id ? playerMap.get(event.player_id) : null;
              const second = event.secondary_player_id ? playerMap.get(event.secondary_player_id) : null;
              return (
                <article key={event.id} className="relative flex items-start gap-3 rounded-3xl border border-white/[0.08] bg-black/25 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-club-red/10 text-sm font-black text-club-light-red">{event.minute}'</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-club-light-red">{eventLabel(event.event_type)}</p>
                    <p className="mt-1 text-sm font-bold text-white">{player ? `${player.first_name} ${player.last_name}` : event.description || "Vereinsereignis"}</p>
                    {second && <p className="mt-1 text-xs text-zinc-500">für {second.first_name} {second.last_name}</p>}
                    {player && event.description && <p className="mt-1 text-xs text-zinc-500">{event.description}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <details className="group">
                      <summary className="flex h-10 cursor-pointer list-none items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[10px] font-black uppercase tracking-wider text-zinc-300 hover:border-club-light-red/30 hover:text-white">
                        Korrigieren
                      </summary>
                      <div className="absolute left-1/2 z-[90] mt-3 max-h-[75vh] w-[min(92vw,34rem)] -translate-x-1/2 overflow-y-auto rounded-3xl border border-club-light-red/20 bg-zinc-950 p-5 shadow-2xl">
                        <p className="club-eyebrow">Statistik korrigieren</p>
                        <p className="mt-2 text-sm text-zinc-400">Änderungen wirken sich automatisch auf Tore, Vorlagen, Karten und Spielerstatistiken aus.</p>
                        <form action={updateMatchEvent} className="mt-4 grid gap-3 sm:grid-cols-2">
                          <input type="hidden" name="match_id" value={match.id} />
                          <input type="hidden" name="event_id" value={event.id} />
                          <Field label="Ereignis">
                            <select name="event_type" defaultValue={event.event_type} className="admin-input">
                              <option value="goal">Tor</option>
                              <option value="yellow_card">Gelbe Karte</option>
                              <option value="red_card">Rote Karte</option>
                              <option value="substitution">Auswechslung</option>
                              <option value="note">Notiz</option>
                            </select>
                          </Field>
                          <Field label="Minute">
                            <input name="minute" type="number" min="0" max="130" defaultValue={event.minute} className="admin-input" />
                          </Field>
                          <Field label="Spieler / Torschütze">
                            <select name="player_id" defaultValue={event.player_id ?? ""} className="admin-input">
                              <option value="">Kein Spieler</option>
                              {players.map((entry) => <option key={entry.id} value={entry.id}>{entry.first_name} {entry.last_name}</option>)}
                            </select>
                          </Field>
                          <Field label="Vorlage / zweiter Spieler">
                            <select name="secondary_player_id" defaultValue={event.secondary_player_id ?? ""} className="admin-input">
                              <option value="">Keine Vorlage / kein zweiter Spieler</option>
                              {players.map((entry) => <option key={entry.id} value={entry.id}>{entry.first_name} {entry.last_name}</option>)}
                            </select>
                          </Field>
                          <Field label="Beschreibung" className="sm:col-span-2">
                            <input name="description" defaultValue={event.description ?? ""} className="admin-input" />
                          </Field>
                          <button type="submit" className="club-button-primary sm:col-span-2">Korrektur speichern</button>
                        </form>
                      </div>
                    </details>
                    <form action={deleteMatchEvent}>
                      <input type="hidden" name="match_id" value={match.id} />
                      <input type="hidden" name="event_id" value={event.id} />
                      <button type="submit" aria-label="Ereignis löschen" className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-950/30 text-red-400"><Trash2 size={16} aria-hidden="true" /></button>
                    </form>
                  </div>
                </article>
              );
            }) : <p className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">Noch keine Ereignisse vorhanden.</p>}
          </div>
        </section>
      </div>

      <FormationEditor
        matchId={match.id}
        players={players}
        initialSquad={squad}
        initialFormation={match.formation ?? "4-4-2"}
      />
    </div>
  );
}

function QuickAction({
  matchId,
  action,
  label,
  icon,
  danger = false,
}: {
  matchId: string;
  action: string;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <form action={quickLiveAction}>
      <input type="hidden" name="match_id" value={matchId} />
      <input type="hidden" name="live_action" value={action} />
      <button
        type="submit"
        className={danger ? "club-button-secondary w-full border-red-500/25 text-red-300" : "club-button-secondary w-full"}
      >
        {icon}
        {label}
      </button>
    </form>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>{children}</label>;
}

function eventLabel(type: string) {
  if (type === "goal") return "Tor";
  if (type === "yellow_card") return "Gelbe Karte";
  if (type === "red_card") return "Rote Karte";
  if (type === "substitution") return "Auswechslung";
  return "Notiz";
}
