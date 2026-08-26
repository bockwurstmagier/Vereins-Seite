"use client";
import { Flag, Pause, Play, Redo2 } from "lucide-react";
import { setLivePhase } from "../../app/admin/live/actions";
export default function LivePhaseControls({matchId,score,events}:{matchId:string;score:string;events:number}){
 function confirmPhase(e:React.MouseEvent<HTMLButtonElement>,phase:string){
   if(phase==="halftime"&&!window.confirm(`Halbzeit bestätigen?\n\nSpielstand: ${score}\nEreignisse: ${events}\n\nDanach wird die Halbzeit-Push gesendet.`))e.preventDefault();
   if(phase==="fulltime"&&!window.confirm(`Abpfiff bestätigen?\n\nEndstand: ${score}\nEreignisse: ${events}\n\nBitte prüfe, ob Tore und Spielstand korrekt sind.`))e.preventDefault();
 }
 const B=({phase,label,icon,danger=false}:{phase:string;label:string;icon:React.ReactNode;danger?:boolean})=><form action={setLivePhase}><input type="hidden" name="match_id" value={matchId}/><input type="hidden" name="phase" value={phase}/><button onClick={e=>confirmPhase(e,phase)} className={`${danger?"border-red-500/25 bg-red-950/30 text-red-300":""} club-button-secondary min-h-16 w-full`}>{icon}{label}</button></form>;
 return <section className="mt-5 grid grid-cols-2 gap-3"><B phase="kickoff" label="Anpfiff" icon={<Play size={19}/>}/><B phase="halftime" label="Halbzeit" icon={<Pause size={19}/>}/><B phase="second_half" label="2. Halbzeit" icon={<Redo2 size={19}/>}/><B phase="fulltime" label="Abpfiff" icon={<Flag size={19}/>} danger/></section>
}
