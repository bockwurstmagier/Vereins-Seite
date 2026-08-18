import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CircleMinus,
  CirclePlus,
  Flag,
  Goal,
  Minus,
  Pause,
  Play,
  TimerReset,
  Plus,
  Redo2,
  RefreshCcw,
  ShieldAlert,
  Undo2,
  UsersRound,
  Sparkles,
  Video,
} from "lucide-react";

import LiveClock from "../../../../components/match-center/LiveClock";
import LiveMomentUploader from "../../../../components/match-center/LiveMomentUploader";
import MatchdayDeviceControls from "../../../../components/match-center/MatchdayDeviceControls";
import { requireRole } from "../../../../lib/auth/roles";
import { getPublicMatchCenterMatch } from "../../../../lib/match-center";
import {
  addCard,
  addGoal,
  addSubstitution,
  changeMinute,
  pauseLiveClock,
  resumeLiveClock,
  setExactMinute,
  setLivePhase,
  undoLastEvent,
  toggleVideoHighlight,
} from "../actions";
import { finalizeMatchDay } from "../../match-center/finalize-actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ goal?: string; card?: string; substitution?: string; undone?: string; paused?: string; resumed?: string; minute?: string }>;
};

export default async function MobileLiveControlPage({ params, searchParams }: PageProps) {
  await requireRole(["administrator", "trainer", "betreuer"]);
  const { id } = await params;
  const notices = await searchParams;
  const data = await getPublicMatchCenterMatch(id);
  if (!data) notFound();

  const { match, players, events } = data;
  const recentEvents = events.slice(0, 8);
  const playerName = new Map(players.map((player) => [player.id, `${player.first_name} ${player.last_name}`]));

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <a href="/admin/live" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red">
        <ArrowLeft size={16} aria-hidden="true" /> Spiele auswählen
      </a>

      <MatchdayDeviceControls />

      {(notices.goal || notices.card || notices.substitution || notices.undone || notices.paused || notices.resumed || notices.minute) && (
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          Änderung wurde live übernommen.
        </div>
      )}

      <section className="club-card mt-6 overflow-hidden">
        <div className="bg-gradient-to-r from-club-burgundy/70 via-club-dark-red/35 to-transparent px-5 py-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-club-light-red">{match.competition}</p>
          <p className="mt-1 text-xs font-bold text-zinc-500">{match.matchday || "Spieltag"}</p>
        </div>

        <div className="p-5 text-center sm:p-7">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <p className="text-sm font-black leading-tight text-white sm:text-lg">{match.home_team}</p>
            <div>
              <p className="text-4xl font-black tabular-nums text-white sm:text-5xl">
                {match.home_score ?? 0}<span className="mx-2 text-club-light-red">:</span>{match.away_score ?? 0}
              </p>
              <LiveClock
                status={match.status}
                current_minute={match.current_minute}
                clock_phase={match.clock_phase}
                clock_started_at={match.clock_started_at}
                clock_base_minute={match.clock_base_minute}
                clock_resume_phase={match.clock_resume_phase}
                prefix="LIVE · "
                syncMinuteInputs
                className="mt-2 block text-[10px] font-black uppercase tracking-[0.2em] text-club-light-red"
              />
            </div>
            <p className="text-sm font-black leading-tight text-white sm:text-lg">{match.away_team}</p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <MinuteButton matchId={match.id} delta={-1} label="-1 Min." icon={<Minus size={19} />} />
            <div className="flex min-h-16 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-2xl font-black tabular-nums text-white">
              <LiveClock
                status={match.status}
                current_minute={match.current_minute}
                clock_phase={match.clock_phase}
                clock_started_at={match.clock_started_at}
                clock_base_minute={match.clock_base_minute}
                clock_resume_phase={match.clock_resume_phase}
              />
            </div>
            <MinuteButton matchId={match.id} delta={1} label="+1 Min." icon={<Plus size={19} />} />
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <PhaseButton matchId={match.id} phase="kickoff" label="Anpfiff" icon={<Play size={19} />} />
        <PhaseButton matchId={match.id} phase="halftime" label="Halbzeit" icon={<Pause size={19} />} />
        <PhaseButton matchId={match.id} phase="second_half" label="2. Halbzeit" icon={<Redo2 size={19} />} />
        <PhaseButton matchId={match.id} phase="fulltime" label="Abpfiff" icon={<Flag size={19} />} danger />
      </section>

      <form action={finalizeMatchDay} className="mt-3">
        <input type="hidden" name="match_id" value={match.id} />
        <button type="submit" className="club-button-primary min-h-20 w-full text-sm">
          <Sparkles size={21} /> Spiel beenden & alles automatisch erstellen
        </button>
      </form>

      <section className="mt-3 grid grid-cols-2 gap-3">
        <form action={pauseLiveClock}>
          <input type="hidden" name="match_id" value={match.id} />
          <button type="submit" className="club-button-secondary min-h-16 w-full">
            <Pause size={19} /> Uhr pausieren
          </button>
        </form>
        <form action={resumeLiveClock}>
          <input type="hidden" name="match_id" value={match.id} />
          <button type="submit" className="club-button-primary min-h-16 w-full">
            <Play size={19} /> Uhr fortsetzen
          </button>
        </form>
      </section>

      <section className="club-card mt-5 p-5">
        <p className="club-eyebrow">Event-Center</p>
        <h2 className="mt-2 text-xl font-black uppercase text-white">Schnellaktionen</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <a href="#goal-event" className="club-button-primary min-h-20 flex-col"><Goal size={22} /> Tor</a>
          <a href="#card-event" className="club-button-secondary min-h-20 flex-col"><ShieldAlert size={22} /> Karte</a>
          <a href="#substitution-event" className="club-button-secondary min-h-20 flex-col"><RefreshCcw size={22} /> Wechsel</a>
          <a href="#live-moment" className="club-button-secondary min-h-20 flex-col"><Video size={22} /> Video</a>
        </div>
      </section>

      <section className="club-card mt-5 p-5">
        <SectionTitle icon={<TimerReset size={20} />} title="Spielminute korrigieren" />
        <form action={setExactMinute} className="mt-5 flex gap-3">
          <input type="hidden" name="match_id" value={match.id} />
          <input name="minute" type="number" min="0" max="130" required defaultValue={match.current_minute} className="admin-input flex-1" />
          <button type="submit" className="club-button-secondary min-h-14">Speichern</button>
        </form>
      </section>

      <section id="goal-event" className="club-card mt-5 scroll-mt-24 p-5">
        <SectionTitle icon={<Goal size={20} />} title="Tor eintragen" />
        <form action={addGoal} className="mt-5 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="match_id" value={match.id} />
          <input type="hidden" name="minute" defaultValue={match.current_minute} data-auto-live-minute="true" />
          <Field label="Mannschaft">
            <select name="side" defaultValue="home" className="admin-input">
              <option value="home">{match.home_team}</option>
              <option value="away">{match.away_team}</option>
            </select>
          </Field>
          <Field label="Torschütze">
            <select name="player_id" defaultValue="" className="admin-input">
              <option value="">Kein Spieler / Gegner</option>
              {players.map((player) => <option key={player.id} value={player.id}>{player.shirt_number !== null ? `#${player.shirt_number} ` : ""}{player.first_name} {player.last_name}</option>)}
            </select>
          </Field>
          <Field label="Vorlage">
            <select name="secondary_player_id" defaultValue="" className="admin-input">
              <option value="">Keine Vorlage</option>
              {players.map((player) => <option key={player.id} value={player.id}>{player.first_name} {player.last_name}</option>)}
            </select>
          </Field>
          <Field label="Notiz">
            <input name="description" className="admin-input" placeholder="z. B. Kopfball nach Ecke" />
          </Field>
          <button type="submit" className="club-button-primary min-h-16 sm:col-span-2"><CirclePlus size={20} /> Tor speichern</button>
        </form>
      </section>

      <section id="card-event" className="club-card mt-5 scroll-mt-24 p-5">
        <SectionTitle icon={<ShieldAlert size={20} />} title="Karte eintragen" />
        <form action={addCard} className="mt-5 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="match_id" value={match.id} />
          <input type="hidden" name="minute" defaultValue={match.current_minute} data-auto-live-minute="true" />
          <Field label="Karte">
            <select name="card" defaultValue="yellow" className="admin-input">
              <option value="yellow">Gelbe Karte</option>
              <option value="red">Rote Karte</option>
            </select>
          </Field>
          <Field label="Spieler">
            <select name="player_id" defaultValue="" className="admin-input">
              <option value="">Kein Spieler / Gegner</option>
              {players.map((player) => <option key={player.id} value={player.id}>{player.first_name} {player.last_name}</option>)}
            </select>
          </Field>
          <Field label="Notiz" className="sm:col-span-2">
            <input name="description" className="admin-input" placeholder="Grund der Karte" />
          </Field>
          <button type="submit" className="club-button-secondary min-h-16 sm:col-span-2"><CircleMinus size={20} /> Karte speichern</button>
        </form>
      </section>

      <section id="substitution-event" className="club-card mt-5 scroll-mt-24 p-5">
        <SectionTitle icon={<UsersRound size={20} />} title="Wechsel eintragen" />
        <form action={addSubstitution} className="mt-5 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="match_id" value={match.id} />
          <input type="hidden" name="minute" defaultValue={match.current_minute} data-auto-live-minute="true" />
          <Field label="Kommt rein">
            <select name="player_id" required className="admin-input">
              <option value="">Spieler auswählen</option>
              {players.map((player) => <option key={player.id} value={player.id}>{player.first_name} {player.last_name}</option>)}
            </select>
          </Field>
          <Field label="Geht raus">
            <select name="secondary_player_id" required className="admin-input">
              <option value="">Spieler auswählen</option>
              {players.map((player) => <option key={player.id} value={player.id}>{player.first_name} {player.last_name}</option>)}
            </select>
          </Field>
          <button type="submit" className="club-button-primary min-h-16 sm:col-span-2"><RefreshCcw size={20} /> Wechsel speichern</button>
        </form>
      </section>

      <section id="live-moment" className="club-card mt-5 scroll-mt-24 p-5">
        <SectionTitle icon={<Video size={20} />} title="Live-Moment mit Video" />
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Elfmeter, Großchance oder besondere Szene direkt vom Handy hochladen.
          Zuschauer sehen den Clip anschließend direkt im Live-Ticker.
        </p>
        <LiveMomentUploader matchId={match.id} defaultMinute={match.current_minute} />
      </section>

      <section className="club-card mt-5 p-5">
        <div className="flex items-center justify-between gap-4">
          <SectionTitle icon={<Undo2 size={20} />} title="Letzte Aktionen" />
          <form action={undoLastEvent}>
            <input type="hidden" name="match_id" value={match.id} />
            <button type="submit" className="club-button-secondary"><Undo2 size={17} /> Rückgängig</button>
          </form>
        </div>
        <div className="mt-5 space-y-3">
          {recentEvents.length ? recentEvents.map((event) => (
            <div key={event.id} className="rounded-2xl border border-white/[0.08] bg-black/25 p-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-club-red/10 text-xs font-black text-club-light-red">{event.minute}'</span>
                <div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-wider text-club-light-red">{eventLabel(event.event_type, event.moment_type)}</p><p className="mt-1 truncate text-sm font-bold text-white">{event.player_id ? playerName.get(event.player_id) : event.description || "Vereinsereignis"}</p></div>
              </div>
              {event.video_url && <form action={toggleVideoHighlight} className="mt-3">
                <input type="hidden" name="match_id" value={match.id}/><input type="hidden" name="event_id" value={event.id}/><input type="hidden" name="next_value" value={event.is_highlight ? "false" : "true"}/>
                <button type="submit" className={event.is_highlight ? "club-button-primary min-h-11 w-full" : "club-button-secondary min-h-11 w-full"}>{event.is_highlight ? "★ Top-Moment markiert" : "☆ Als Top-Moment markieren"}</button>
              </form>}
            </div>
          )) : <p className="text-sm text-zinc-500">Noch keine Ereignisse vorhanden.</p>}
        </div>
      </section>
    </div>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>{children}</label>;
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center gap-3"><span className="club-icon-box">{icon}</span><h2 className="text-lg font-black uppercase text-white">{title}</h2></div>;
}

function MinuteButton({ matchId, delta, label, icon }: { matchId: string; delta: number; label: string; icon: React.ReactNode }) {
  return <form action={changeMinute}><input type="hidden" name="match_id" value={matchId} /><input type="hidden" name="delta" value={delta} /><button type="submit" className="club-button-secondary min-h-16 w-full">{icon}{label}</button></form>;
}

function PhaseButton({ matchId, phase, label, icon, danger = false }: { matchId: string; phase: string; label: string; icon: React.ReactNode; danger?: boolean }) {
  return <form action={setLivePhase}><input type="hidden" name="match_id" value={matchId} /><input type="hidden" name="phase" value={phase} /><button type="submit" className={`${danger ? "border-red-500/25 bg-red-950/30 text-red-300" : ""} club-button-secondary min-h-16 w-full`}>{icon}{label}</button></form>;
}

function eventLabel(type: string, momentType?: string | null) {
  if (momentType === "penalty") return "Elfmeter";
  if (momentType === "moment") return "Live-Moment";
  if (type === "goal") return "Tor";
  if (type === "yellow_card") return "Gelbe Karte";
  if (type === "red_card") return "Rote Karte";
  if (type === "substitution") return "Wechsel";
  return "Ticker";
}
