import Link from "next/link";
import { Activity, ArrowRight, CalendarClock, CheckCircle2, Circle, Flag, Goal, Pause, Play, Radio, Sparkles, Trophy, Video } from "lucide-react";

import { setLivePhase } from "../live/actions";
import { finalizeMatchDay } from "../match-center/finalize-actions";
import { requireRole } from "../../../lib/auth/roles";
import { assistantGoalLines, getMatchdayAssistantData, type AssistantPhase } from "../../../lib/matchday-assistant";

const dateFmt=new Intl.DateTimeFormat("de-DE",{weekday:"short",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});

export default async function MatchdayAssistantPage(){
 await requireRole(["administrator","trainer","betreuer"]);
 const data=await getMatchdayAssistantData();
 if(!data) return <div className="mx-auto max-w-6xl pb-24"><p className="club-eyebrow">HUJA Spieltags-Assistent</p><h1 className="club-heading mt-2">Kein Spiel gefunden</h1><p className="mt-4 text-zinc-500">Lege zuerst ein Spiel an.</p></div>;
 const {match,phase,stats}=data;
 const goals=assistantGoalLines(data);
 const score=`${match.home_score??0}:${match.away_score??0}`;
 const phaseInfo=phaseCopy(phase);
 const nextAction=nextStep(phase);
 const pollState=!data.fanPoll?"Noch nicht gestartet":data.fanPoll.status==="open"?"Voting läuft":"Voting beendet";
 const latest=[...data.events].reverse().find(e=>!["Anpfiff","Halbzeit","Anpfiff zur zweiten Halbzeit","Abpfiff"].includes(e.description??""));
 return <div className="mx-auto max-w-7xl pb-24">
  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
   <div><p className="club-eyebrow">HUJA Spieltags-Assistent</p><h1 className="club-heading mt-2">Dein Spieltag. Eine Zentrale.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">HUJA erkennt die aktuelle Spielphase und verbindet Live-Steuerung, Ticker, Videos, Abschluss-Automatik, Voting und Medienausgabe.</p></div>
   <div className={`rounded-2xl border px-4 py-3 ${phaseInfo.tone}`}><p className="text-[10px] font-black uppercase tracking-[.18em] opacity-70">Aktuelle Phase</p><p className="mt-1 text-lg font-black uppercase">{phaseInfo.label}</p></div>
  </div>

  <section className="mt-8 overflow-hidden rounded-[2rem] border border-club-light-red/20 bg-gradient-to-br from-club-burgundy/70 via-black/80 to-black shadow-[0_0_55px_rgba(193,18,31,.12)]">
   <div className="grid gap-0 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
    <div className="p-6 text-center lg:text-right"><p className="text-lg font-black text-white">{match.home_team}</p></div>
    <div className="border-y border-white/10 bg-black/25 px-8 py-6 text-center lg:border-x lg:border-y-0"><p className="text-[10px] font-black uppercase tracking-[.2em] text-zinc-600">{match.competition}{match.matchday?` · ${match.matchday}`:""}</p><p className="mt-2 text-5xl font-black text-white">{score}</p><p className="mt-2 text-xs font-black uppercase tracking-wider text-club-light-red">{phaseInfo.label}{match.status==="live"?` · ${match.current_minute??0}'`:""}</p></div>
    <div className="p-6 text-center lg:text-left"><p className="text-lg font-black text-white">{match.away_team}</p></div>
   </div>
   <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 bg-black/20 px-5 py-4 text-xs text-zinc-500"><span>{dateFmt.format(new Date(match.match_date))}</span><span>{match.location||"Spielort noch offen"}</span><span>{data.squadCount} Spieler im Kader</span></div>
  </section>

  <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
   <div className="club-card p-5 sm:p-6">
    <p className="club-eyebrow">Jetzt sinnvoll</p><div className="mt-3 flex items-start gap-4"><div className="club-icon-box shrink-0">{nextAction.icon}</div><div><h2 className="text-xl font-black uppercase text-white">{nextAction.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{nextAction.text}</p></div></div>
    <div className="mt-5">{actionForPhase(phase,match.id,data.outputReady)}</div>
   </div>
   <div className="club-card p-5 sm:p-6"><p className="club-eyebrow">Spieltag-Status</p><div className="mt-4 space-y-3">
    <Status ok={data.squadCount>0} label="Spieltagskader" detail={data.squadCount>0?`${data.squadCount} Spieler hinterlegt`:"Noch kein Kader hinterlegt"}/>
    <Status ok={match.status!=="scheduled"} label="LiveCenter" detail={match.status==="scheduled"?"Noch nicht gestartet":match.status==="live"?"Spiel läuft":"Spiel beendet"}/>
    <Status ok={stats.videos>0} neutral={match.status!=="finished"} label="Video-Momente" detail={`${stats.videos} Clip${stats.videos===1?"":"s"} · ${stats.highlights} Top-Moment${stats.highlights===1?"":"e"}`}/>
    <Status ok={data.outputReady} neutral={match.status!=="finished"} label="Abschluss-Automatik" detail={data.outputReady?"Bericht & Social-Ausgabe erstellt":"Noch nicht ausgeführt"}/>
    <Status ok={Boolean(data.fanPoll)} neutral={match.status!=="finished"} label="Spieler des Spiels" detail={pollState}/>
   </div></div>
  </section>

  {(phase==="halftime"||phase==="second_half"||phase==="postgame"||phase==="completed")&&<section className="club-card mt-6 p-5 sm:p-6">
   <div className="flex items-center gap-3"><Pause className="text-club-light-red"/><div><p className="club-eyebrow">Automatische Zusammenfassung</p><h2 className="mt-1 text-xl font-black uppercase text-white">{phase==="halftime"?"Halbzeit-Fazit":"Bisheriger Spielverlauf"}</h2></div></div>
   <p className="mt-4 text-lg font-black text-white">{match.home_team} <span className="text-club-light-red">{score}</span> {match.away_team}</p>
   {goals.length?<div className="mt-4 space-y-2">{goals.map((line,i)=><p key={`${line}-${i}`} className="rounded-xl border border-white/[.06] bg-black/25 px-4 py-3 text-sm font-bold text-zinc-300">⚽ {line}</p>)}</div>:<p className="mt-4 text-sm text-zinc-500">Noch keine Tore im LiveCenter dokumentiert.</p>}
   <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-zinc-500"><span className="rounded-full border border-white/10 px-3 py-1">{stats.cards} Karten</span><span className="rounded-full border border-white/10 px-3 py-1">{stats.substitutions} Wechsel</span><span className="rounded-full border border-white/10 px-3 py-1">{stats.videos} Videos</span></div>
  </section>}

  {match.status==="live"&&<section className="mt-6 grid gap-4 sm:grid-cols-4"><Metric icon={<Goal size={18}/>} value={stats.goals} label="Tore"/><Metric icon={<Activity size={18}/>} value={stats.cards} label="Karten"/><Metric icon={<Video size={18}/>} value={stats.videos} label="Videos"/><Metric icon={<Sparkles size={18}/>} value={stats.highlights} label="Top-Momente"/></section>}

  {latest&&match.status==="live"&&<section className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Letztes Ereignis</p><p className="mt-1 text-sm font-black text-white">{latest.minute}' · {data.playerNames[latest.player_id??""]||latest.description||latest.event_type}</p></section>}

  <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
   <Quick href={`/admin/live/${match.id}`} label="Live-Steuerung" icon={<Radio size={18}/>}/><Quick href={`/admin/match-center/${match.id}`} label="Match-Center" icon={<Activity size={18}/>}/><Quick href={`/match-center/${match.id}`} label="Fan-Liveansicht" icon={<Goal size={18}/>} external/><Quick href="/admin/grafikstudio" label="Grafikstudio" icon={<Sparkles size={18}/>}/>
  </section>
 </div>;
}

function phaseCopy(phase:AssistantPhase){
 const map:Record<AssistantPhase,{label:string;tone:string}>={
  countdown:{label:"Vor dem Spiel",tone:"border-white/10 bg-white/[.04] text-zinc-300"},
  first_half:{label:"1. Halbzeit LIVE",tone:"border-red-500/30 bg-red-950/35 text-red-300"},
  paused:{label:"Spieluhr pausiert",tone:"border-amber-500/25 bg-amber-950/25 text-amber-300"},
  halftime:{label:"Halbzeit",tone:"border-amber-500/25 bg-amber-950/25 text-amber-300"},
  second_half:{label:"2. Halbzeit LIVE",tone:"border-red-500/30 bg-red-950/35 text-red-300"},
  postgame:{label:"Abpfiff · Abschluss offen",tone:"border-club-light-red/25 bg-club-red/10 text-club-light-red"},
  completed:{label:"Spieltag abgeschlossen",tone:"border-emerald-500/25 bg-emerald-950/25 text-emerald-300"},
 }; return map[phase];
}
function nextStep(phase:AssistantPhase){
 if(phase==="countdown")return{title:"Spieltag vorbereiten",text:"Prüfe Aufstellung und Spielinformationen. Wenn der Schiedsrichter anpfeift, startest du hier direkt den LiveCenter-Modus.",icon:<CalendarClock size={20}/>};
 if(phase==="first_half")return{title:"LiveTicker steuern",text:"Trage Tore, Karten, Wechsel und Video-Momente ein. Zur Pause stoppt „Halbzeit“ die Uhr und erzeugt automatisch dein Halbzeit-Fazit.",icon:<Radio size={20}/>};
 if(phase==="paused")return{title:"Spieluhr prüfen",text:"Die Uhr ist pausiert. Öffne die Live-Steuerung und setze sie fort, sobald das Spiel weitergeht.",icon:<Pause size={20}/>};
 if(phase==="halftime")return{title:"Bereit für Halbzeit zwei",text:"HUJA hat den bisherigen Spielverlauf zusammengefasst. Mit „2. Halbzeit starten“ beginnt die Uhr sauber bei 45:00.",icon:<Play size={20}/>};
 if(phase==="second_half")return{title:"Zweite Halbzeit läuft",text:"Ticker und Videos laufen weiter. Nach dem Abpfiff wechselst du automatisch in die Abschlussphase.",icon:<Radio size={20}/>};
 if(phase==="postgame")return{title:"Spieltag automatisch abschließen",text:"Ergebnis steht. Jetzt kann HUJA Bericht, Social-Texte, News, Abschlussdaten und den Abpfiff-Push mit der bestehenden Ein-Klick-Automatik erzeugen.",icon:<Sparkles size={20}/>};
 return{title:"Spieltag ist fertig",text:"Die Abschlussausgabe ist erstellt. Jetzt kannst du Voting, News, Social-Texte, Highlights und Grafiken weiterverwenden.",icon:<CheckCircle2 size={20}/>};
}
function actionForPhase(phase:AssistantPhase,id:string,outputReady:boolean){
 if(phase==="countdown")return <form action={setLivePhase}><input type="hidden" name="match_id" value={id}/><input type="hidden" name="phase" value="kickoff"/><button className="club-button-primary min-h-14"><Play size={18}/> Anpfiff · LIVE starten</button></form>;
 if(phase==="first_half")return <div className="flex flex-wrap gap-3"><Link href={`/admin/live/${id}`} className="club-button-primary"><Radio size={18}/> Live-Steuerung öffnen</Link><form action={setLivePhase}><input type="hidden" name="match_id" value={id}/><input type="hidden" name="phase" value="halftime"/><button className="club-button-secondary"><Pause size={18}/> Halbzeit</button></form></div>;
 if(phase==="paused")return <Link href={`/admin/live/${id}`} className="club-button-primary"><Play size={18}/> Uhr fortsetzen</Link>;
 if(phase==="halftime")return <form action={setLivePhase}><input type="hidden" name="match_id" value={id}/><input type="hidden" name="phase" value="second_half"/><button className="club-button-primary min-h-14"><Play size={18}/> 2. Halbzeit starten</button></form>;
 if(phase==="second_half")return <div className="flex flex-wrap gap-3"><Link href={`/admin/live/${id}`} className="club-button-primary"><Radio size={18}/> Live-Steuerung</Link><form action={setLivePhase}><input type="hidden" name="match_id" value={id}/><input type="hidden" name="phase" value="fulltime"/><button className="club-button-secondary"><Flag size={18}/> Abpfiff setzen</button></form></div>;
 if(phase==="postgame"&&!outputReady)return <form action={finalizeMatchDay}><input type="hidden" name="match_id" value={id}/><input type="hidden" name="publish_report" value="true"/><button className="club-button-primary min-h-16"><Sparkles size={19}/> Alles erstellen & Spieltag abschließen</button></form>;
 return <div className="flex flex-wrap gap-3"><Link href={`/admin/match-center/${id}/abschluss`} className="club-button-primary"><CheckCircle2 size={18}/> Abschluss ansehen</Link><Link href={`/admin/match-center/${id}`} className="club-button-secondary"><Trophy size={18}/> Voting & Match-Center</Link></div>;
}
function Status({ok,neutral=false,label,detail}:{ok:boolean;neutral?:boolean;label:string;detail:string}){return <div className="flex items-start gap-3">{neutral?<Circle size={18} className="mt-0.5 text-zinc-700"/>:ok?<CheckCircle2 size={18} className="mt-0.5 text-emerald-400"/>:<Circle size={18} className="mt-0.5 text-amber-500"/>}<div><p className="text-sm font-black text-white">{label}</p><p className="mt-1 text-xs text-zinc-600">{detail}</p></div></div>}
function Metric({icon,value,label}:{icon:React.ReactNode;value:number;label:string}){return <div className="club-card p-4"><div className="flex items-center gap-3 text-club-light-red">{icon}<p className="text-2xl font-black text-white">{value}</p></div><p className="mt-2 text-[10px] font-black uppercase tracking-wider text-zinc-600">{label}</p></div>}
function Quick({href,label,icon,external=false}:{href:string;label:string;icon:React.ReactNode;external?:boolean}){return <Link href={href} target={external?"_blank":undefined} rel={external?"noreferrer":undefined} className="club-card flex min-h-20 items-center gap-3 p-4 text-sm font-black uppercase text-white transition hover:border-club-light-red/30"> <span className="text-club-light-red">{icon}</span><span>{label}</span><ArrowRight size={15} className="ml-auto text-zinc-700"/></Link>}
