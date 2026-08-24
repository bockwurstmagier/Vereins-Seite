"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Flame, Radio } from "lucide-react";

const REACTIONS=["🔥","❤️","👏","⚽"] as const;
function deviceId(){
  const key="huja-device-id";
  let id=localStorage.getItem(key);
  if(!id){id=crypto.randomUUID();localStorage.setItem(key,id)}
  return id;
}

export default function LiveReactionBar({matchId,status}:{matchId:string;status:"scheduled"|"live"|"finished"}){
 const [counts,setCounts]=useState<Record<string,number>>({});
 const [message,setMessage]=useState("");
 const [hype,setHype]=useState(false);
 const previousTotal=useRef(0);
 const total=useMemo(()=>Object.values(counts).reduce((a,b)=>a+b,0),[counts]);

 async function load(){
   try{
     const r=await fetch(`/api/matchday/react?matchId=${encodeURIComponent(matchId)}&t=${Date.now()}`,{cache:"no-store"});
     const p=await r.json(); if(r.ok)setCounts(p.counts??{});
   }catch{}
 }
 useEffect(()=>{
   void load();
   if(status!=="live")return;
   const tick=()=>{if(document.visibilityState==="visible")void load()};
   const timer=window.setInterval(tick,15000);
   return()=>window.clearInterval(timer);
 },[matchId,status]);

 useEffect(()=>{
   if(total>previousTotal.current && total>=10 && Math.floor(total/10)>Math.floor(previousTotal.current/10)){
     setHype(true);const t=window.setTimeout(()=>setHype(false),1800);previousTotal.current=total;return()=>window.clearTimeout(t);
   }
   previousTotal.current=total;
 },[total]);

 async function react(reaction:string){
   setMessage("");
   try{
     const r=await fetch("/api/matchday/react",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({matchId,deviceId:deviceId(),reaction})});
     const p=await r.json();
     if(r.ok)setCounts(p.counts??{});
     else setMessage(p.error??"Reaktion konnte nicht gesendet werden.");
   }catch{setMessage("Reaktion konnte nicht gesendet werden.")}
 }

 if(status==="scheduled")return null;
 return <section className="club-card relative mt-6 overflow-hidden p-5 sm:p-6">
   {hype&&<div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-black/85 backdrop-blur-md"><div className="text-center"><Flame size={45} className="mx-auto text-club-light-red"/><p className="mt-3 text-5xl font-black italic text-white">HUJA!</p><p className="mt-2 text-xs font-black uppercase tracking-[.3em] text-club-light-red">Die Fans sind da</p></div></div>}
   <div className="flex items-center justify-between gap-3"><div><p className="club-eyebrow">Stadion-Reaktionen</p><h2 className="mt-1 text-xl font-black uppercase text-white">Was sagt die Kurve?</h2></div><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-black text-zinc-400"><Radio size={13} className={status==="live"?"animate-pulse text-red-400":""}/>{total}</span></div>
   <div className="mt-5 grid grid-cols-4 gap-2">{REACTIONS.map(x=><button key={x} type="button" disabled={status!=="live"} onClick={()=>react(x)} className="min-h-16 rounded-2xl border border-white/10 bg-white/[.04] text-2xl transition active:scale-95 disabled:opacity-50">{x}<span className="ml-1 text-[10px] font-black text-zinc-500">{counts[x]??0}</span></button>)}</div>
   {status==="live"?<p className="mt-3 text-xs text-zinc-600">Ein Tipp genügt – deine Reaktion landet direkt in der HUJA Live-Regie.</p>:<p className="mt-3 text-xs text-zinc-600">Endstand der Fan-Reaktionen zu diesem Spiel.</p>}
   {message&&<p className="mt-2 text-xs font-bold text-amber-300">{message}</p>}
 </section>
}
