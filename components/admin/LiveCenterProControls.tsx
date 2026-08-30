"use client";

import { useEffect, useMemo, useState } from "react";
import { Goal, ShieldAlert, RefreshCcw, Undo2, Wifi, WifiOff, Star, X } from "lucide-react";
import { addGoal, undoLastEvent } from "../../app/admin/live/actions";

type Player={id:string;first_name:string;last_name:string;shirt_number:number|null};
export default function LiveCenterProControls({matchId,homeTeam,awayTeam,players,defaultMinute}:{matchId:string;homeTeam:string;awayTeam:string;players:Player[];defaultMinute:number}){
 const [online,setOnline]=useState(true);
 const [open,setOpen]=useState(false);
 const [step,setStep]=useState<"scorer"|"assist">("scorer");
 const [scorer,setScorer]=useState("");
 const [favoriteIds,setFavoriteIds]=useState<string[]>([]);
 const clubPattern=/middelich|resse/i;
 const ourSide=clubPattern.test(homeTeam)?"home":clubPattern.test(awayTeam)?"away":"home";
 const opponentTeam=ourSide==="home"?awayTeam:homeTeam;

 useEffect(()=>{
   const sync=()=>setOnline(navigator.onLine);sync();
   window.addEventListener("online",sync);window.addEventListener("offline",sync);
   try{setFavoriteIds(JSON.parse(localStorage.getItem("huja-live-favorites")||"[]"))}catch{}
   return()=>{window.removeEventListener("online",sync);window.removeEventListener("offline",sync)}
 },[]);
 const ordered=useMemo(()=>[...players].sort((a,b)=>{
   const af=favoriteIds.includes(a.id)?0:1,bf=favoriteIds.includes(b.id)?0:1;
   return af-bf||a.last_name.localeCompare(b.last_name,"de",{sensitivity:"base"})||a.first_name.localeCompare(b.first_name,"de",{sensitivity:"base"});
 }),[players,favoriteIds]);
 function fav(id:string){
   const next=favoriteIds.includes(id)?favoriteIds.filter(x=>x!==id):[...favoriteIds,id];
   setFavoriteIds(next);localStorage.setItem("huja-live-favorites",JSON.stringify(next));navigator.vibrate?.(15);
 }
 function chooseScorer(id:string){setScorer(id);setStep("assist");navigator.vibrate?.(18)}
 function close(){setOpen(false);setStep("scorer");setScorer("")}
 return <>
   {!online&&<div className="sticky top-2 z-[90] mb-3 flex items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-950/95 px-4 py-3 text-xs font-black uppercase text-amber-200 shadow-2xl"><WifiOff size={16}/> Keine Verbindung – nichts speichern</div>}
   <section className="sticky top-2 z-50 mt-4 rounded-3xl border border-white/10 bg-[#090909]/95 p-3 shadow-2xl backdrop-blur-xl">
    <div className="mb-3 flex items-center justify-between px-1"><span className="text-[10px] font-black uppercase tracking-[.18em] text-zinc-500">LiveCenter Pro</span><span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase ${online?"text-emerald-400":"text-amber-300"}`}>{online?<Wifi size={13}/>:<WifiOff size={13}/>} {online?"Online":"Offline"}</span></div>
    <div className="grid grid-cols-4 gap-2">
      <button type="button" disabled={!online} onClick={()=>{setOpen(true);setStep("scorer");navigator.vibrate?.(20)}} className="club-button-primary min-h-16 flex-col text-xs"><Goal size={21}/>TOR</button>
      <a href="#card-event" className="club-button-secondary min-h-16 flex-col text-xs"><ShieldAlert size={20}/>Karte</a>
      <a href="#substitution-event" className="club-button-secondary min-h-16 flex-col text-xs"><RefreshCcw size={20}/>Wechsel</a>
      <form action={undoLastEvent}><input type="hidden" name="match_id" value={matchId}/><button disabled={!online} onClick={()=>navigator.vibrate?.(25)} className="club-button-secondary min-h-16 w-full flex-col text-xs"><Undo2 size={20}/>Undo</button></form>
    </div>
   </section>

   {open&&<div className="fixed inset-0 z-[220] flex items-end bg-black/80 backdrop-blur-sm sm:items-center sm:justify-center" onClick={close}>
    <div className="max-h-[88dvh] w-full overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#0b0b0b] p-5 sm:max-w-lg sm:rounded-[2rem]" onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between"><div><p className="club-eyebrow">⚡ TOR MIDDELICH · {ourSide==="home"?"🏠 HEIM":"🚌 AUSWÄRTS"}</p><h2 className="mt-1 text-xl font-black uppercase text-white">{step==="scorer"?"Wer hat für uns getroffen?":"Wer gab die Vorlage?"}</h2></div><button type="button" onClick={close} className="club-icon-box"><X size={19}/></button></div>
      {step==="scorer"?<div className="mt-5 grid gap-2">
        {ordered.map(p=><div key={p.id} className="flex gap-2"><button type="button" onClick={()=>chooseScorer(p.id)} className="flex min-h-14 flex-1 items-center rounded-2xl border border-white/10 bg-white/[.04] px-4 text-left text-sm font-black text-white">{p.shirt_number!=null?<span className="mr-3 text-club-light-red">#{p.shirt_number}</span>:null}{p.first_name} {p.last_name}</button><button type="button" onClick={()=>fav(p.id)} className={`w-14 rounded-2xl border border-white/10 ${favoriteIds.includes(p.id)?"bg-amber-400/15 text-amber-300":"bg-white/[.04] text-zinc-600"}`}><Star size={18} className="mx-auto" fill={favoriteIds.includes(p.id)?"currentColor":"none"}/></button></div>)}
        <form action={addGoal} className="mt-2"><input type="hidden" name="match_id" value={matchId}/><input type="hidden" name="minute" value={defaultMinute} data-auto-live-minute="true"/><input type="hidden" name="side" value={ourSide}/><button className="club-button-secondary min-h-14 w-full">Tor ohne Torschütze speichern</button></form>
        <form action={addGoal}><input type="hidden" name="match_id" value={matchId}/><input type="hidden" name="minute" value={defaultMinute} data-auto-live-minute="true"/><input type="hidden" name="side" value={ourSide==="home"?"away":"home"}/><input type="hidden" name="description" value="Tor für den Gegner"/><button className="min-h-14 w-full rounded-2xl border border-red-500/20 bg-red-950/25 text-sm font-black text-red-300">{`⚽ Gegentor · ${opponentTeam}`}</button></form>
      </div>:<div className="mt-5 grid gap-2">
        <form action={addGoal}><input type="hidden" name="match_id" value={matchId}/><input type="hidden" name="minute" value={defaultMinute} data-auto-live-minute="true"/><input type="hidden" name="side" value={ourSide}/><input type="hidden" name="player_id" value={scorer}/><button onClick={()=>navigator.vibrate?.([20,30,35])} className="club-button-primary min-h-16 w-full">Keine Vorlage · TOR SPEICHERN</button></form>
        {ordered.filter(p=>p.id!==scorer).map(p=><form action={addGoal} key={p.id}><input type="hidden" name="match_id" value={matchId}/><input type="hidden" name="minute" value={defaultMinute} data-auto-live-minute="true"/><input type="hidden" name="side" value={ourSide}/><input type="hidden" name="player_id" value={scorer}/><input type="hidden" name="secondary_player_id" value={p.id}/><button onClick={()=>navigator.vibrate?.([20,30,35])} className="min-h-14 w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 text-left text-sm font-black text-white">{p.first_name} {p.last_name}</button></form>)}
        <button type="button" onClick={()=>setStep("scorer")} className="club-button-secondary mt-2 min-h-12 w-full">← Torschütze ändern</button>
      </div>}
    </div>
   </div>}
 </>;
}
