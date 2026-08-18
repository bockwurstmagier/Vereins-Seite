"use client";
import { useEffect,useState } from "react";
import { Award, ChevronRight, ShieldCheck, Trophy } from "lucide-react";
const KEY="huja-anonymous-device-v1";
function id(){let v=localStorage.getItem(KEY);if(!v){v=crypto.randomUUID?.()??`${Date.now()}-${Math.random()}`;localStorage.setItem(KEY,v)}return v}
type Badge={key:string;icon:string;title:string;description:string;unlocked:boolean};
type Data={displayName:string;points:number;level:number;levelName:string;nextLevelPoints:number;tips:number;exactTips:number;votes:number;reactionMatches:number;badges:Badge[]};
export default function FanPassCard(){
 const [data,setData]=useState<Data|null>(null),[open,setOpen]=useState(false),[name,setName]=useState(""),[busy,setBusy]=useState(false);
 async function load(action?:string){setBusy(true);const r=await fetch("/api/fan-pass",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({deviceId:id(),action,displayName:name})});const p=await r.json();if(r.ok){setData(p.data);setName(p.data.displayName)}setBusy(false)}
 useEffect(()=>{load()},[]);
 if(!data)return null;
 const currentMin=[0,10,25,50,100,200][data.level-1]??0, span=Math.max(1,data.nextLevelPoints-currentMin), progress=data.level>=6?100:Math.min(100,((data.points-currentMin)/span)*100);
 return <section className="club-section py-6"><div className="club-container"><div className="club-card overflow-hidden border-club-light-red/20">
  <button onClick={()=>setOpen(!open)} className="flex w-full items-center gap-4 p-5 text-left">
   <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-club-light-red/30 bg-club-burgundy/50"><ShieldCheck className="text-club-light-red"/></div>
   <div className="min-w-0 flex-1"><p className="club-eyebrow">HUJA Fanpass</p><h2 className="truncate text-lg font-black uppercase text-white">{data.displayName} · {data.levelName}</h2><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-club-light-red" style={{width:`${progress}%`}}/></div><p className="mt-1 text-xs text-zinc-500">{data.points} Fanpunkte{data.level<6?` · nächster Rang bei ${data.nextLevelPoints}`:" · Maximalrang"}</p></div>
   <ChevronRight className={`text-zinc-500 transition ${open?"rotate-90":""}`}/>
  </button>
  {open&&<div className="border-t border-white/10 p-5">
   <div className="grid grid-cols-4 gap-2 text-center">{[[data.tips,"Tipps"],[data.exactTips,"Volltreffer"],[data.votes,"Votes"],[data.reactionMatches,"Live"]].map(([v,l])=><div key={String(l)} className="rounded-xl bg-white/[0.04] p-2"><p className="text-lg font-black text-white">{v}</p><p className="text-[10px] uppercase text-zinc-500">{l}</p></div>)}</div>
   <div className="mt-5"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400"><Award size={15}/> Saison-Challenges</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{data.badges.map(b=><div key={b.key} className={`rounded-xl border p-3 ${b.unlocked?"border-club-light-red/30 bg-club-burgundy/20":"border-white/5 bg-black/20 opacity-50"}`}><p className="font-black text-white">{b.icon} {b.title}</p><p className="mt-1 text-xs text-zinc-500">{b.description}</p></div>)}</div></div>
   <div className="mt-5 flex gap-2"><input value={name} maxLength={30} onChange={e=>setName(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Dein Fan-Name"/><button disabled={busy} onClick={()=>load("rename")} className="club-button-primary">{busy?"…":"Speichern"}</button></div>
   <p className="mt-3 text-[11px] text-zinc-600">Der Fanpass läuft anonym auf diesem Browser/Gerät. Keine Anmeldung nötig.</p>
  </div>}
 </div></div></section>
}
