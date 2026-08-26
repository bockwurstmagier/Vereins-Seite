"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Beaker,
  Bell,
  Flag,
  Goal,
  Pause,
  Play,
  Redo2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  UsersRound,
  Volume2,
  X,
} from "lucide-react";

type Player={
  id:string;
  first_name:string;
  last_name:string;
  shirt_number:number|null;
  image_url:string|null;
};

type Event={
  id:string;
  type:"goal"|"yellow"|"red"|"sub";
  minute:number;
  player?:string;
  assist?:string;
};

type Overlay =
  | {kind:"goal"; headline:string; minute:number; player?:string; assist?:string; score:string}
  | {kind:"phase"; headline:string; score:string}
  | {kind:"push"; title:string; body:string}
  | null;

export default function TestLabSimulator({players}:{players:Player[]}){
  const sorted=useMemo(
    ()=>[...players].sort(
      (a,b)=>a.last_name.localeCompare(b.last_name,"de",{sensitivity:"base"})||
      a.first_name.localeCompare(b.first_name,"de",{sensitivity:"base"}),
    ),
    [players],
  );

  const [minute,setMinute]=useState(0);
  const [phase,setPhase]=useState("Bereit");
  const [home,setHome]=useState(0);
  const [away,setAway]=useState(0);
  const [events,setEvents]=useState<Event[]>([]);
  const [scorer,setScorer]=useState(sorted[0]?.id??"");
  const [assist,setAssist]=useState("");
  const [overlay,setOverlay]=useState<Overlay>(null);

  const [goalSoundUrl,setGoalSoundUrl]=useState("/sounds/goal.wav");
  const [goalSoundStart,setGoalSoundStart]=useState(0);
  const [goalSoundEnd,setGoalSoundEnd]=useState<number|null>(null);
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const soundTimerRef=useRef<number|null>(null);
  const overlayTimerRef=useRef<number|null>(null);

  useEffect(()=>{
    fetch("/api/match-experience",{cache:"no-store"})
      .then(r=>r.json())
      .then(data=>{
        if(data.goalSoundUrl)setGoalSoundUrl(data.goalSoundUrl);
        setGoalSoundStart(Number(data.goalSoundStart??0));
        setGoalSoundEnd(data.goalSoundEnd==null?null:Number(data.goalSoundEnd));
      })
      .catch(()=>{});
    return()=>{
      if(soundTimerRef.current)window.clearTimeout(soundTimerRef.current);
      if(overlayTimerRef.current)window.clearTimeout(overlayTimerRef.current);
      audioRef.current?.pause();
    };
  },[]);

  const player=(id?:string)=>sorted.find(p=>p.id===id);
  const name=(id?:string)=>{
    const p=player(id);
    return p?`${p.first_name} ${p.last_name}`:"";
  };

  function showOverlay(next:Overlay,duration=4500){
    if(overlayTimerRef.current)window.clearTimeout(overlayTimerRef.current);
    setOverlay(next);
    if(next){
      overlayTimerRef.current=window.setTimeout(()=>setOverlay(null),duration);
    }
  }

  function playGoalSound(){
    if(soundTimerRef.current)window.clearTimeout(soundTimerRef.current);
    audioRef.current?.pause();
    const audio=new Audio(goalSoundUrl);
    audioRef.current=audio;
    audio.preload="auto";
    audio.volume=.9;

    const start=Math.max(0,goalSoundStart);
    const end=goalSoundEnd;

    const begin=()=>{
      try{audio.currentTime=start}catch{}
      void audio.play().catch(()=>{});
      if(end!==null&&end>start){
        soundTimerRef.current=window.setTimeout(()=>{
          audio.pause();
          try{audio.currentTime=start}catch{}
        },(end-start)*1000);
      }
    };

    if(audio.readyState>=1)begin();
    else audio.addEventListener("loadedmetadata",begin,{once:true});
  }

  function add(type:Event["type"],playerId=scorer,secondary=assist){
    setEvents(v=>[
      {id:crypto.randomUUID(),type,minute,player:playerId||undefined,assist:secondary||undefined},
      ...v,
    ]);
    navigator.vibrate?.(18);
  }

  function goalHeadline(nextHome:number,playerId:string){
    const count=events.filter(e=>e.type==="goal"&&e.player===playerId).length+1;
    if(count>=3)return "HATTRICK!";
    if(count===2)return "DOPPELPACK!";
    if(minute>=85)return "LAST-MINUTE!";
    if(nextHome===away)return "AUSGLEICH!";
    if(nextHome===away+1)return "FÜHRUNG!";
    return "TOOOOR!";
  }

  function goal(){
    const nextHome=home+1;
    const headline=goalHeadline(nextHome,scorer);
    setHome(nextHome);
    add("goal");
    playGoalSound();
    showOverlay({
      kind:"goal",
      headline,
      minute,
      player:scorer||undefined,
      assist:assist||undefined,
      score:`${nextHome}:${away}`,
    },6200);
  }

  function opponent(){
    const nextAway=away+1;
    setAway(nextAway);
    setEvents(v=>[{id:crypto.randomUUID(),type:"goal",minute},...v]);
    navigator.vibrate?.(18);
  }

  function setPhaseAndPreview(nextPhase:string,nextMinute:number,headline:string){
    setPhase(nextPhase);
    setMinute(nextMinute);
    showOverlay({kind:"phase",headline,score:`${home}:${away}`});
  }

  function reset(){
    setMinute(0);
    setPhase("Bereit");
    setHome(0);
    setAway(0);
    setEvents([]);
    setOverlay(null);
    audioRef.current?.pause();
  }

  function scenario(kind:"hattrick"|"comeback"|"last"){
    const p=scorer;
    if(kind==="hattrick"){
      const generated=[67,38,12].map(m=>({
        id:crypto.randomUUID(),
        type:"goal" as const,
        minute:m,
        player:p||undefined,
      }));
      setHome(3);
      setAway(0);
      setMinute(67);
      setPhase("2. Halbzeit");
      setEvents(generated);
      playGoalSound();
      showOverlay({
        kind:"goal",
        headline:"HATTRICK!",
        minute:67,
        player:p||undefined,
        score:"3:0",
      },6200);
    }

    if(kind==="comeback"){
      const generated:Event[]=[
        {id:crypto.randomUUID(),type:"goal",minute:82,player:p||undefined},
        {id:crypto.randomUUID(),type:"goal",minute:74,player:p||undefined},
        {id:crypto.randomUUID(),type:"goal",minute:61,player:p||undefined},
        {id:crypto.randomUUID(),type:"goal",minute:49},
        {id:crypto.randomUUID(),type:"goal",minute:31},
      ];
      setHome(3);
      setAway(2);
      setMinute(82);
      setPhase("2. Halbzeit");
      setEvents(generated);
      playGoalSound();
      showOverlay({
        kind:"goal",
        headline:"COMEBACK!",
        minute:82,
        player:p||undefined,
        score:"3:2",
      },6200);
    }

    if(kind==="last"){
      const generated:Event[]=[
        {id:crypto.randomUUID(),type:"goal",minute:89,player:p||undefined},
        {id:crypto.randomUUID(),type:"goal",minute:53},
        {id:crypto.randomUUID(),type:"goal",minute:18,player:p||undefined},
      ];
      setHome(2);
      setAway(1);
      setMinute(89);
      setPhase("2. Halbzeit");
      setEvents(generated);
      playGoalSound();
      showOverlay({
        kind:"goal",
        headline:"LAST-MINUTE!",
        minute:89,
        player:p||undefined,
        score:"2:1",
      },6200);
    }
  }

  function previewPush(kind:"halftime"|"goal"){
    if(kind==="halftime"){
      showOverlay({
        kind:"push",
        title:"⏸️ HALBZEIT",
        body:`Middelich-Resse ${home}:${away} Testgegner`,
      },5000);
    }else{
      showOverlay({
        kind:"push",
        title:"⚽ TOOOOR für Middelich!",
        body:`${minute}. Minute · ${name(scorer)||"Middelich-Resse"} · ${home}:${away}`,
      },5000);
    }
  }

  const selectedScorer=player(scorer);

  return <div className="space-y-5">
    <div className="sticky top-20 z-30 rounded-3xl border border-amber-400/25 bg-amber-950/95 p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Beaker className="text-amber-300"/>
        <div>
          <p className="text-sm font-black uppercase text-amber-200">Testmodus aktiv</p>
          <p className="text-xs text-amber-400/80">Nur lokale Simulation · keine Pushs · keine Statistiken · nicht öffentlich</p>
        </div>
      </div>
    </div>

    <section className="club-card overflow-hidden">
      <div className="p-6 text-center">
        <p className="club-eyebrow">HUJA Testspiel</p>
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <b>Middelich-Resse</b>
          <div>
            <p className="text-5xl font-black">{home}<span className="mx-2 text-club-light-red">:</span>{away}</p>
            <p className="mt-2 text-xs font-black text-club-light-red">{minute}' · {phase}</p>
          </div>
          <b>Testgegner</b>
        </div>
      </div>
    </section>

    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <button onClick={()=>setPhaseAndPreview("1. Halbzeit",1,"ANPFIFF")} className="club-button-primary min-h-16"><Play size={18}/>Anpfiff</button>
      <button onClick={()=>setPhaseAndPreview("Halbzeit",45,"HALBZEIT")} className="club-button-secondary min-h-16"><Pause size={18}/>Halbzeit</button>
      <button onClick={()=>setPhaseAndPreview("2. Halbzeit",46,"2. HALBZEIT")} className="club-button-secondary min-h-16"><Redo2 size={18}/>2. Halbzeit</button>
      <button onClick={()=>setPhaseAndPreview("Abpfiff",90,"ABPFIFF")} className="club-button-secondary min-h-16"><Flag size={18}/>Abpfiff</button>
    </section>

    <section className="club-card p-5">
      <p className="club-eyebrow">LiveCenter Simulation</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-xs font-black text-zinc-500">Torschütze</span>
          <select className="admin-input" value={scorer} onChange={e=>setScorer(e.target.value)}>
            {sorted.map(p=><option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-xs font-black text-zinc-500">Vorlage</span>
          <select className="admin-input" value={assist} onChange={e=>setAssist(e.target.value)}>
            <option value="">Keine Vorlage</option>
            {sorted.filter(p=>p.id!==scorer).map(p=><option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button onClick={goal} className="club-button-primary min-h-16 flex-col"><Goal size={20}/>Tor + Animation</button>
        <button onClick={opponent} className="club-button-secondary min-h-16 flex-col"><Goal size={20}/>Gegentor</button>
        <button onClick={()=>add("yellow")} className="club-button-secondary min-h-16 flex-col"><ShieldAlert size={20}/>Gelb</button>
        <button onClick={()=>add("sub")} className="club-button-secondary min-h-16 flex-col"><UsersRound size={20}/>Wechsel</button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={()=>setMinute(v=>Math.max(0,v-1))} className="club-button-secondary">-1</button>
        <div className="flex-1 text-center text-2xl font-black">{minute}'</div>
        <button onClick={()=>setMinute(v=>Math.min(130,v+1))} className="club-button-secondary">+1</button>
      </div>
    </section>

    <section className="club-card p-5">
      <div className="flex items-center gap-3">
        <Sparkles className="text-club-light-red"/>
        <div>
          <p className="club-eyebrow">Fan-Ansicht</p>
          <h2 className="text-lg font-black uppercase">Live-Regie testen</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button onClick={()=>scenario("hattrick")} className="club-button-secondary min-h-14">🔥 Hattrick + Animation</button>
        <button onClick={()=>scenario("comeback")} className="club-button-secondary min-h-14">⚡ Comeback + Animation</button>
        <button onClick={()=>scenario("last")} className="club-button-secondary min-h-14">⏱️ Last-Minute + Animation</button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <button onClick={playGoalSound} className="club-button-secondary min-h-14"><Volume2 size={17}/>Tor-Sound testen</button>
        <button onClick={()=>previewPush("goal")} className="club-button-secondary min-h-14"><Bell size={17}/>Tor-Push Vorschau</button>
        <button onClick={()=>previewPush("halftime")} className="club-button-secondary min-h-14"><Bell size={17}/>Halbzeit-Push Vorschau</button>
      </div>
      <p className="mt-3 text-xs text-zinc-600">Der Sound verwendet euren aktuell gespeicherten Start-/End-Ausschnitt. Push-Vorschauen werden nur auf deinem Bildschirm dargestellt und niemals versendet.</p>
    </section>

    <section className="club-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black uppercase">Test-Timeline</h2>
        <button onClick={reset} className="club-button-secondary"><RotateCcw size={16}/>Reset</button>
      </div>
      <div className="mt-4 space-y-2">
        {events.length?events.map(e=><div key={e.id} className="rounded-2xl border border-white/10 bg-black/25 p-3 text-sm">
          <b className="text-club-light-red">{e.minute}'</b> · {e.type==="goal"?"⚽ Tor":e.type==="yellow"?"🟨 Gelb":e.type==="red"?"🟥 Rot":"🔄 Wechsel"}
          {e.player&&<span> · {name(e.player)}</span>}
          {e.assist&&<span className="text-zinc-500"> · Vorlage {name(e.assist)}</span>}
        </div>):<p className="text-sm text-zinc-500">Noch keine Test-Ereignisse.</p>}
      </div>
    </section>

    {overlay?.kind==="goal"&&<div className="fixed inset-0 z-[300] grid place-items-center overflow-y-auto bg-black/95 px-5 py-8 backdrop-blur-2xl">
      <button type="button" onClick={()=>setOverlay(null)} className="fixed right-5 top-5 z-10 grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-black/60 text-white"><X size={20}/></button>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(185,28,28,.7),rgba(0,0,0,.95)_68%)]"/>
      <div className="relative w-full max-w-xl text-center animate-[liveEventIn_.35s_ease-out]">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] border border-white/20 bg-club-red shadow-[0_0_80px_rgba(220,38,38,.55)]"><Goal size={42}/></div>
        <p className="mt-6 text-xs font-black uppercase tracking-[.45em] text-red-300">HUJA · {overlay.minute}. Minute</p>
        <h2 className="mt-2 text-5xl font-black italic tracking-tight text-white sm:text-8xl">{overlay.headline}</h2>
        {player(overlay.player)?.image_url&&<div className="relative mx-auto mt-5 h-52 w-44 overflow-hidden rounded-[2rem] border border-white/20 bg-black/30 shadow-[0_0_70px_rgba(220,38,38,.35)] sm:h-64 sm:w-52">
          <img src={player(overlay.player)!.image_url!} alt="" className="h-full w-full object-cover object-top"/>
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent"/>
        </div>}
        <p className="mt-5 text-3xl font-black uppercase text-white">{name(overlay.player)||"Middelich-Resse"}</p>
        {overlay.assist&&<p className="mt-2 text-sm font-bold uppercase tracking-wider text-zinc-400">Vorlage: {name(overlay.assist)}</p>}
        <div className="mx-auto mt-7 inline-flex rounded-2xl border border-white/15 bg-black/45 px-5 py-3 text-lg font-black">
          Middelich-Resse <span className="mx-3 text-club-light-red">{overlay.score}</span> Testgegner
        </div>
        <p className="mt-5 text-[10px] font-black uppercase tracking-[.3em] text-amber-300">🧪 Test-Vorschau · nicht öffentlich</p>
      </div>
    </div>}

    {overlay?.kind==="phase"&&<div className="fixed inset-0 z-[300] grid place-items-center bg-black/90 px-5 backdrop-blur-xl">
      <button type="button" onClick={()=>setOverlay(null)} className="fixed right-5 top-5 grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-black/60"><X size={20}/></button>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(127,29,29,.55),transparent_60%)]"/>
      <div className="relative text-center">
        <Sparkles className="mx-auto text-club-light-red" size={42}/>
        <p className="mt-5 text-xs font-black uppercase tracking-[.45em] text-club-light-red">HUJA Match Experience</p>
        <p className="mt-3 text-5xl font-black italic text-white sm:text-7xl">{overlay.headline}</p>
        <p className="mt-4 text-xl font-black text-zinc-300">Middelich-Resse <span className="text-club-light-red">{overlay.score}</span> Testgegner</p>
        <p className="mt-5 text-[10px] font-black uppercase tracking-[.3em] text-amber-300">🧪 Test-Vorschau · nicht öffentlich</p>
      </div>
    </div>}

    {overlay?.kind==="push"&&<div className="fixed inset-x-4 top-24 z-[320] mx-auto max-w-md rounded-[2rem] border border-white/15 bg-[#111]/95 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-club-red/20 text-club-light-red"><Bell size={21}/></div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[.2em] text-amber-300">🧪 Push-Vorschau</p>
          <p className="mt-1 font-black text-white">{overlay.title}</p>
          <p className="mt-1 text-sm text-zinc-400">{overlay.body}</p>
          <p className="mt-2 text-[10px] font-bold uppercase text-zinc-600">Diese Nachricht wurde nicht versendet.</p>
        </div>
        <button type="button" onClick={()=>setOverlay(null)} className="text-zinc-500"><X size={18}/></button>
      </div>
    </div>}
  </div>;
}
