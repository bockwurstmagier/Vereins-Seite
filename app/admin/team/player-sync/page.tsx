import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, ExternalLink, RefreshCw, Search, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import { createClient } from "../../../../lib/supabase/server";
import { discoverFussballPlayerProfiles, FUSSBALL_TEAM_URL } from "../../../../lib/fussball-player-sync";
import { isPlayingProfile } from "../../../../lib/player-role";
import { importFussballBirthdays } from "./actions";

type Params = Promise<{ imported?: string; found?: string }>;

export default async function PlayerSyncPage({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("id,first_name,last_name,birth_date,position,squad,is_active")
    .eq("is_active", true)
    .order("last_name");
  const players = (data ?? []).filter(isPlayingProfile);
  const result = error ? null : await discoverFussballPlayerProfiles(players);
  const importable = result?.matches.filter((m) => m.status === "exact" && m.candidate?.birthDate && !m.player.birth_date).length ?? 0;

  return <div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="club-eyebrow">HUJA Player Sync</p><h1 className="club-heading mt-2">FUSSBALL.DE Geburtstage</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">HUJA durchsucht öffentliche Spielseiten, sammelt dort verlinkte Spielerprofile und gleicht sie automatisch mit euren aktiven Spielern ab. Bestehende Geburtstage werden nicht überschrieben.</p></div>
      <Link href="/admin/team" className="club-button-secondary"><ArrowLeft size={17}/> Mannschaft</Link>
    </div>

    {params.imported !== undefined && <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-300">{params.imported} Geburtstag/Geburtstage übernommen. {params.found ?? "0"} öffentliche Spielerprofile wurden beim Lauf erkannt.</div>}

    <section className="club-card mt-8 p-5 sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div><p className="flex items-center gap-2 text-sm font-black text-white"><ShieldCheck size={18} className="text-club-light-red"/> Automatischer Abgleich</p><p className="mt-2 text-sm leading-6 text-zinc-400">Eindeutige Namens-Treffer mit öffentlich sichtbarem Geburtsdatum können mit einem Klick übernommen werden. Spieler ohne öffentlichen Geburtstag bleiben unverändert.</p></div>
        <form action={importFussballBirthdays}><button className="club-button-primary" disabled={!importable}><RefreshCw size={17}/> {importable ? `${importable} eindeutige übernehmen` : "Nichts zu übernehmen"}</button></form>
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-xs text-zinc-500"><span>{result?.matchPagesScanned ?? 0} Spielseiten geprüft</span><span>·</span><span>{result?.profilesFound ?? 0} Profile erkannt</span><span>·</span><a href={FUSSBALL_TEAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-club-light-red hover:text-white">Mannschaftsseite <ExternalLink size={12}/></a></div>
    </section>

    {result?.warning && <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200"><div className="flex gap-2"><TriangleAlert size={18} className="mt-0.5 shrink-0"/><p>{result.warning}</p></div></div>}

    <div className="mt-6 space-y-3">
      {result?.matches.map((match) => <article key={match.player.id} className="club-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><p className="font-black text-white">{match.player.first_name} {match.player.last_name}</p><p className="mt-1 text-xs text-zinc-500">HUJA: {match.player.birth_date ? formatDate(match.player.birth_date) : "Geburtstag fehlt"}</p></div>
          <Status status={match.status}/>
        </div>
        {match.candidate && <div className="mt-4 rounded-2xl border border-white/[.07] bg-black/25 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-black text-zinc-200">{match.candidate.name}</p><p className="mt-1 flex items-center gap-2 text-xs text-zinc-500"><CalendarDays size={13}/> {match.candidate.birthDate ? formatDate(match.candidate.birthDate) : "Geburtsdatum nicht öffentlich"}</p></div><a href={match.candidate.profileUrl} target="_blank" rel="noreferrer" className="club-button-secondary min-h-9 px-3 py-2 text-[10px]">Profil <ExternalLink size={12}/></a></div>
          {match.player.birth_date && match.candidate.birthDate && <p className="mt-3 text-xs font-bold text-emerald-400">Vorhandener HUJA-Geburtstag bleibt geschützt und wird nicht überschrieben.</p>}
          {match.status === "possible" && <p className="mt-3 text-xs text-amber-300">Ähnlicher Treffer – wird aus Sicherheitsgründen nicht automatisch importiert.</p>}
        </div>}
      </article>)}
      {!result?.matches.length && <div className="club-card p-6 text-sm text-zinc-400">Keine aktiven Spieler für den Abgleich gefunden.</div>}
    </div>
  </div>;
}

function Status({status}:{status:"exact"|"possible"|"not_found"}) {
  if(status==="exact") return <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase text-emerald-300"><CheckCircle2 size={13}/> Eindeutig</span>;
  if(status==="possible") return <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase text-amber-300"><Search size={13}/> Prüfen</span>;
  return <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[.03] px-3 py-1 text-[10px] font-black uppercase text-zinc-500"><XCircle size={13}/> Kein Treffer</span>;
}
function formatDate(value:string){const [y,m,d]=value.split("-");return `${d}.${m}.${y}`;}
