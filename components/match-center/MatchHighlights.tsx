"use client";
import { Play, Star, Trophy } from "lucide-react";
import type { MatchCenterEvent } from "../../lib/match-center";
export default function MatchHighlights({events,status}:{events:MatchCenterEvent[];status:"scheduled"|"live"|"finished"}){
 const clips=events.filter(e=>e.video_url).sort((a,b)=>Boolean(a.is_highlight)!==Boolean(b.is_highlight)?(a.is_highlight?-1:1):a.minute-b.minute);
 if(!clips.length)return null;
 return <section className="club-card mt-6 overflow-hidden">
  <div className="border-b border-white/10 bg-gradient-to-r from-club-burgundy/75 via-club-dark-red/30 to-transparent p-5 sm:p-6">
   <div className="flex items-center justify-between gap-4"><div><p className="club-eyebrow">HUJA MatchTV</p><h2 className="mt-1 flex items-center gap-2 text-2xl font-black uppercase text-white"><Trophy className="text-club-light-red" size={22}/> Highlights des Spiels</h2></div><span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-black uppercase text-zinc-400">{clips.length} Clip{clips.length===1?"":"s"}</span></div>
   <p className="mt-2 text-sm text-zinc-400">{status==="finished"?"Alle Video-Momente dieses Spiels gesammelt an einem Ort.":"Die Highlights wachsen während des Spiels automatisch mit."}</p>
  </div>
  <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">{clips.map((e,i)=><article key={e.id} className={`overflow-hidden rounded-3xl border bg-black/30 ${e.is_highlight?"border-amber-400/35":"border-white/10"}`}>
   <div className="relative bg-black"><video src={e.video_url!} controls playsInline preload="metadata" className="aspect-video w-full object-contain"/>{e.is_highlight&&<span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1 rounded-full border border-amber-300/30 bg-black/80 px-3 py-1 text-[10px] font-black uppercase text-amber-300"><Star size={12} fill="currentColor"/> Top-Moment</span>}</div>
   <div className="p-4"><p className="text-[10px] font-black uppercase tracking-wider text-club-light-red">{e.minute}. Minute · {e.moment_type==="penalty"?"Elfmeter":"Live-Moment"}</p><p className="mt-1 text-sm font-black text-white">{e.description||`Video-Highlight #${i+1}`}</p><p className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-600"><Play size={11}/> Replay verfügbar</p></div>
  </article>)}</div>
 </section>
}
