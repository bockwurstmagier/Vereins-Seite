import { ArrowRight, CalendarDays, Clock3, MapPin, Trophy } from "lucide-react";
import type { DatabaseMatch } from "../../lib/matches";
import { isMiddelichResse } from "../../lib/club-name";
import CupTeamLogo from "./CupTeamLogo";

export default function CupMatch({ match }: { match: DatabaseMatch | null }) {
  if (!match) return null;
  const kickoff = new Date(match.match_date);
  const date = new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" }).format(kickoff);
  const time = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(kickoff);
  return <section className="club-section py-10"><div className="club-container">
    <a href={`/match-center/${match.id}`} className="group relative block overflow-hidden rounded-[2rem] border border-amber-300/50 text-white shadow-[0_12px_50px_rgba(245,158,11,0.13)] transition hover:border-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(180,120,25,.3), transparent 65%), linear-gradient(150deg, #211708, #120b0b 55%, #050505)" }}>
      <div aria-hidden="true" className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
      <div className="border-b border-amber-300/15 px-5 pb-5 pt-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-amber-200"><Trophy size={14} aria-hidden="true" />Pokalduell</span>
        <h2 className="mt-3 break-words text-3xl font-black uppercase leading-tight tracking-tight text-amber-100">{match.competition || "Kreispokal"}</h2>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[.18em] text-amber-200/70">Nächstes Pokalspiel{match.matchday ? ` · ${match.matchday}` : ""}</p>
      </div>
      <div className="px-4 py-6 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3">
          <Team name={match.home_team} logo={match.home_logo_url} side="Heim" />
          <div className="pt-7 text-center"><Trophy size={23} className="mx-auto text-amber-300" aria-hidden="true" /><span className="mt-2 block text-xs font-black tracking-widest text-amber-100/60">VS</span></div>
          <Team name={match.away_team} logo={match.away_logo_url} side="Gast" />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 rounded-2xl border border-amber-200/10 bg-black/25 px-3 py-3 text-xs font-bold text-amber-50/90">
          <span className="inline-flex items-center gap-2"><CalendarDays size={15} className="text-amber-300" aria-hidden="true" />{date}</span>
          <span className="inline-flex items-center gap-2"><Clock3 size={15} className="text-amber-300" aria-hidden="true" />{time} Uhr</span>
        </div>
        {match.location && <p className="mt-3 flex items-start justify-center gap-2 text-center text-xs leading-5 text-zinc-400"><MapPin size={14} className="mt-0.5 shrink-0 text-amber-300/70" aria-hidden="true" />{match.location}</p>}
        <span className="mt-5 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-amber-500 px-3 text-center text-xs font-black uppercase tracking-wide text-zinc-950 shadow-lg transition group-hover:brightness-110">Zum Pokal-Matchcenter<ArrowRight size={17} aria-hidden="true" /></span>
      </div>
    </a>
  </div></section>;
}

function Team({ name, logo, side }: { name: string; logo?: string | null; side: string }) {
  const src = logo || (isMiddelichResse(name) ? "/branding/middelich-resse-original.png" : null);
  return <div className="min-w-0 text-center">
    <CupTeamLogo key={src} src={src} name={name} />
    <p className="mt-3 break-words text-xs font-black leading-5 text-white sm:text-sm">{name}</p>
    <p className="mt-1 text-[9px] font-bold uppercase tracking-[.2em] text-amber-200/50">{side}</p>
  </div>;
}
