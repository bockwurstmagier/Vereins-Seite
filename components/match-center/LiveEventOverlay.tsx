"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Goal, RefreshCcw, ShieldAlert, Sparkles } from "lucide-react";
import PushNotificationControl from "./PushNotificationControl";
import type { MatchCenterEvent, MatchCenterPlayer } from "../../lib/match-center";

type Props = {
  events: MatchCenterEvent[];
  players: MatchCenterPlayer[];
  homeTeam: string;
  awayTeam: string;
  score: string;
  status: "scheduled" | "live" | "finished";
  clockPhase: string | null;
};

export default function LiveEventOverlay({events,players,homeTeam,awayTeam,score,status,clockPhase}:Props) {
  const [visibleEvent,setVisibleEvent]=useState<MatchCenterEvent|null>(null);
  const [phaseMessage,setPhaseMessage]=useState<string|null>(null);
  const [goalSoundUrl,setGoalSoundUrl]=useState("/sounds/goal.wav");
  const previousId=useRef(events[0]?.id??null);
  const previousPhase=useRef(clockPhase);
  const previousStatus=useRef(status);
  const playerMap=useMemo(()=>new Map(players.map(p=>[p.id,`${p.first_name} ${p.last_name}`])),[players]);

  useEffect(()=>{ fetch("/api/match-experience",{cache:"no-store"}).then(r=>r.json()).then(x=>{if(x.goalSoundUrl)setGoalSoundUrl(x.goalSoundUrl)}).catch(()=>{}); },[]);
  useEffect(()=>{
    const latest=events[0];
    if(!latest||latest.id===previousId.current)return;
    previousId.current=latest.id; setVisibleEvent(latest);
    const timer=window.setTimeout(()=>setVisibleEvent(null), latest.event_type==="goal"?6200:4200);
    if(latest.event_type==="goal"&&window.localStorage.getItem("huja-live-sound")==="true"){
      const audio=new Audio(goalSoundUrl); audio.volume=.85; void audio.play().catch(()=>{});
    }
    return()=>window.clearTimeout(timer);
  },[events,goalSoundUrl]);

  useEffect(()=>{
    let message:string|null=null;
    if(previousStatus.current!=="finished"&&status==="finished") message="ABPFIFF";
    else if(previousPhase.current!=="halftime"&&clockPhase==="halftime") message="HALBZEIT";
    else if(previousStatus.current==="scheduled"&&status==="live") message="ANPFIFF";
    previousPhase.current=clockPhase; previousStatus.current=status;
    if(!message)return;
    setPhaseMessage(message);
    const timer=window.setTimeout(()=>setPhaseMessage(null),4500);
    return()=>window.clearTimeout(timer);
  },[clockPhase,status]);

  const isGoal=visibleEvent?.event_type==="goal";
  const scorer=visibleEvent?.player_id?playerMap.get(visibleEvent.player_id):null;
  const assist=visibleEvent?.secondary_player_id?playerMap.get(visibleEvent.secondary_player_id):null;

  return <>
    <PushNotificationControl />
    {phaseMessage&&<div className="pointer-events-none fixed inset-0 z-[90] grid place-items-center overflow-hidden bg-black/90 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(127,29,29,.55),transparent_60%)]"/>
      <div className="relative text-center">
        <Sparkles className="mx-auto text-club-light-red" size={42}/>
        <p className="mt-5 text-xs font-black uppercase tracking-[.45em] text-club-light-red">HUJA Match Experience</p>
        <p className="mt-3 text-5xl font-black italic text-white sm:text-7xl">{phaseMessage}</p>
        <p className="mt-4 text-xl font-black text-zinc-300">{homeTeam} <span className="text-club-light-red">{score}</span> {awayTeam}</p>
      </div>
    </div>}
    {visibleEvent&&isGoal&&<div className="pointer-events-none fixed inset-0 z-[95] grid place-items-center overflow-hidden bg-black/95 px-5 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(185,28,28,.7),rgba(0,0,0,.95)_68%)]"/>
      <div className="absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-red-800/20 blur-3xl"/>
      <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-club-red/20 blur-3xl"/>
      <div className="relative w-full max-w-xl text-center animate-[liveEventIn_.35s_ease-out]">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] border border-white/20 bg-club-red shadow-[0_0_80px_rgba(220,38,38,.55)]"><Goal size={42}/></div>
        <p className="mt-6 text-xs font-black uppercase tracking-[.45em] text-red-300">HUJA · {visibleEvent.minute}. Minute</p>
        <h2 className="mt-2 text-6xl font-black italic tracking-tight text-white sm:text-8xl">TOOOOR!</h2>
        <p className="mt-5 text-3xl font-black uppercase text-white">{scorer||visibleEvent.description||"Middelich-Resse"}</p>
        {assist&&<p className="mt-2 text-sm font-bold uppercase tracking-wider text-zinc-400">Vorlage: {assist}</p>}
        <div className="mx-auto mt-7 inline-flex rounded-2xl border border-white/15 bg-black/45 px-5 py-3 text-lg font-black">{homeTeam} <span className="mx-3 text-club-light-red">{score}</span> {awayTeam}</div>
      </div>
    </div>}
    {visibleEvent&&!isGoal&&<div className="pointer-events-none fixed inset-x-4 top-20 z-[70] mx-auto max-w-md animate-[liveEventIn_.35s_ease-out] rounded-[2rem] border border-club-light-red/30 bg-black/90 p-5 text-center shadow-[0_0_60px_rgba(220,38,38,.45)] backdrop-blur-2xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-club-red text-white">{eventIcon(visibleEvent.event_type)}</div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[.25em] text-club-light-red">{visibleEvent.minute}' · {eventTitle(visibleEvent.event_type)}</p>
      <p className="mt-2 text-2xl font-black text-white">{scorer||visibleEvent.description||`${homeTeam} ${score} ${awayTeam}`}</p>
    </div>}
  </>;
}
function eventTitle(type:MatchCenterEvent["event_type"]){if(type==="goal")return"TOOOOR!";if(type==="yellow_card")return"Gelbe Karte";if(type==="red_card")return"Rote Karte";if(type==="substitution")return"Auswechslung";return"Live-Update"}
function eventIcon(type:MatchCenterEvent["event_type"]){if(type==="goal")return <Goal size={28}/>;if(type==="yellow_card"||type==="red_card")return <ShieldAlert size={28}/>;return <RefreshCcw size={28}/>}
