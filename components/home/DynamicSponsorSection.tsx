"use client";
import { motion } from "framer-motion";
import { ExternalLink, Handshake } from "lucide-react";
import type { PublicSponsor } from "../../lib/sponsors";
export default function DynamicSponsorSection({ sponsors }:{sponsors:PublicSponsor[]}) {
  const loop = sponsors.length > 1 ? [...sponsors, ...sponsors] : sponsors;
  return <section id="sponsors" className="club-section py-10"><div className="club-container"><div className="mb-6"><div className="flex items-center gap-2"><Handshake size={16} className="text-club-light-red"/><p className="club-eyebrow">Gemeinsam stark</p></div><h2 className="club-heading mt-2">Unsere Partner</h2></div>
  {!sponsors.length ? <div className="club-card p-6 text-sm text-zinc-400">Aktuell sind noch keine Sponsoren veröffentlicht.</div> : <div className="club-card overflow-hidden py-5"><div className="overflow-hidden"><motion.div className="flex w-max gap-4 px-4" animate={sponsors.length > 1 ? {x:["0%","-50%"]}:{}} transition={{duration:24,ease:"linear",repeat:Infinity}}>{loop.map((s,i)=><a key={`${s.id}-${i}`} href={s.website_url || "/sponsoren"} target={s.website_url?"_blank":undefined} rel={s.website_url?"noreferrer":undefined} className="flex h-32 w-48 shrink-0 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.045] p-4"><div className="flex h-16 w-full items-center justify-center rounded-2xl bg-white p-3">{s.logo_url ? <img src={s.logo_url} alt={s.name} className="max-h-full max-w-full object-contain"/> : <span className="text-center text-sm font-black text-zinc-800">{s.name}</span>}</div><div className="mt-3 flex items-center gap-1 text-[9px] font-black uppercase text-zinc-500">{s.category}<ExternalLink size={11}/></div></a>)}</motion.div></div></div>}
  <a href="/sponsoren" className="club-button-secondary mt-5 w-full">Alle Sponsoren</a></div></section>;
}
