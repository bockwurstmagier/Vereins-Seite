"use client";
import { BookOpen, Goal, ShieldAlert, ArrowRightLeft, MessageCircle } from "lucide-react";
import type { MatchCenterEvent, MatchCenterPlayer } from "../../lib/match-center";
type Props={events:MatchCenterEvent[];players:MatchCenterPlayer[];status:"scheduled"|"live"|"finished";homeTeam:string;awayTeam:string;score:string};
export default function MatchStory({events,players,status,homeTeam,awayTeam,score}:Props){
 if(!events.length)return null;
 const names=new Map(players.map(p=>[p.id,`${p.first_name} ${p.last_name}`]));
 const chronological=[...events].sort((a,b)=>a.minute-b.minute||new Date(a.created_at).getTime()-new Date(b.created_at).getTime());
 return <section className="club-card mt-6 overflow-hidden">
  <div className="border-b border-white/10 bg-gradient-to-r from-club-burgundy/70 to-transparent p-5 sm:p-6">
   <p className="club-eyebrow">HUJA Match Story</p><div className="mt-2 flex items-center gap-3"><BookOpen className="text-club-light-red"/><h2 className="text-2xl font-black uppercase">{status==="finished"?"Die Story des Spiels":"Das Spiel als Story"}</h2></div>
   <p className="mt-2 text-sm text-zinc-400">{homeTeam} <b className="text-white">{score}</b> {awayTeam} · automatisch aus dem LiveCenter</p>
  </div>
  <div className="relative p-5 sm:p-6"><div className="absolute bottom-7 left-[42px] top-7 w-px bg-gradient-to-b from-club-light-red/60 via-white/10 to-transparent"/>
   <div className="space-y-4">{chronological.map((e,i)=>{const player=e.player_id?names.get(e.player_id):null;const second=e.secondary_player_id?names.get(e.secondary_player_id):null;return <article key={e.id} className="relative flex gap-4">
    <div className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${e.event_type==="goal"?"border-club-light-red/40 bg-club-red text-white":"border-white/10 bg-zinc-950 text-zinc-400"}`}>{icon(e.event_type)}</div>
    <div className="min-w-0 flex-1 rounded-2xl border border-white/[.07] bg-black/25 p-4">
     <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-wider text-club-light-red">{e.minute}. Minute · {label(e.event_type,e.moment_type)}</p>{i===chronological.length-1&&status==="live"&&<span className="h-2 w-2 animate-pulse rounded-full bg-red-500"/>}</div>
     <p className="mt-1 font-black text-white">{player||e.description||"Spielereignis"}</p>
     {second&&<p className="mt-1 text-xs text-zinc-500">{e.event_type==="goal"?"Vorlage":"für"}: {second}</p>}
     {player&&e.description&&<p className="mt-1 text-xs text-zinc-500">{e.description}</p>}
     {e.video_url&&<video src={e.video_url} controls playsInline preload="metadata" className="mt-3 max-h-72 w-full rounded-xl bg-black object-contain"/>}
    </div>
   </article>})}</div>
  </div>
 </section>
}
function label(t:MatchCenterEvent["event_type"],m:MatchCenterEvent["moment_type"]){if(t==="goal")return m==="penalty"?"Elfmetertor":"Tor";if(t==="yellow_card")return"Gelbe Karte";if(t==="red_card")return"Rote Karte";if(t==="substitution")return"Wechsel";return m==="penalty"?"Elfmeter-Moment":"Live-Moment"}
function icon(t:MatchCenterEvent["event_type"]){if(t==="goal")return <Goal size={19}/>;if(t.includes("card"))return <ShieldAlert size={19}/>;if(t==="substitution")return <ArrowRightLeft size={19}/>;return <MessageCircle size={19}/>}
