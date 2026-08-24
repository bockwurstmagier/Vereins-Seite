"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Square, Save } from "lucide-react";
import { saveGoalSoundTrim } from "../../app/admin/einstellungen/actions";

export default function GoalSoundStudio({url,start,end}:{url:string;start:number;end:number|null}){
 const audioRef=useRef<HTMLAudioElement>(null);
 const stopTimer=useRef<number|null>(null);
 const [duration,setDuration]=useState(0);
 const [startValue,setStartValue]=useState(start||0);
 const [endValue,setEndValue]=useState<number|null>(end);
 const [playing,setPlaying]=useState(false);

 useEffect(()=>()=>{if(stopTimer.current)window.clearTimeout(stopTimer.current)},[]);

 function clamp(v:number){return Math.max(0,Math.min(duration||9999,v))}
 function preview(){
   const audio=audioRef.current;if(!audio)return;
   if(stopTimer.current)window.clearTimeout(stopTimer.current);
   const from=clamp(startValue);
   const to=endValue==null?duration:clamp(endValue);
   audio.currentTime=from;
   audio.volume=.9;
   void audio.play();
   setPlaying(true);
   if(to>from){
     stopTimer.current=window.setTimeout(()=>{audio.pause();setPlaying(false)},Math.max(0,(to-from)*1000));
   }
 }
 function stop(){const audio=audioRef.current;if(audio)audio.pause();if(stopTimer.current)window.clearTimeout(stopTimer.current);setPlaying(false)}

 return <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-5">
   <p className="text-xs font-black uppercase tracking-wider text-zinc-500">Goal Sound Studio</p>
   <h3 className="mt-1 text-lg font-black uppercase text-white">Ausschnitt auswählen</h3>
   <p className="mt-2 text-sm leading-6 text-zinc-400">Wähle nur die Stelle, die beim Tor abgespielt werden soll. Beispiel: Start 12,0 s und Ende 16,0 s = exakt 4 Sekunden.</p>

   <audio ref={audioRef} src={url} preload="metadata" onLoadedMetadata={e=>{const d=e.currentTarget.duration||0;setDuration(d);if(endValue==null&&d)setEndValue(Math.min(d,4))}} onEnded={()=>setPlaying(false)} className="hidden"/>

   {duration>0&&<div className="mt-5">
     <div className="relative h-3 rounded-full bg-white/10">
       <div className="absolute h-3 rounded-full bg-club-red" style={{left:`${Math.min(100,(startValue/duration)*100)}%`,right:`${Math.max(0,100-(((endValue??duration)/duration)*100))}%`}}/>
     </div>
     <div className="mt-2 flex justify-between text-[10px] font-bold text-zinc-600"><span>0:00</span><span>{duration.toFixed(1)} s</span></div>
   </div>}

   <form action={saveGoalSoundTrim} className="mt-5 grid gap-4 sm:grid-cols-2">
     <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">Start in Sekunden</span><input name="start_seconds" type="number" min="0" step="0.1" max={duration||undefined} value={startValue} onChange={e=>setStartValue(Number(e.target.value))} className="admin-input"/></label>
     <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">Ende in Sekunden</span><input name="end_seconds" type="number" min="0" step="0.1" max={duration||undefined} value={endValue??""} onChange={e=>setEndValue(e.target.value===""?null:Number(e.target.value))} className="admin-input"/></label>

     {duration>0&&<>
       <label className="sm:col-span-2 block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">Startpunkt</span><input type="range" min="0" max={duration} step="0.1" value={Math.min(startValue,duration)} onChange={e=>setStartValue(Number(e.target.value))} className="w-full accent-red-600"/></label>
       <label className="sm:col-span-2 block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">Endpunkt</span><input type="range" min="0" max={duration} step="0.1" value={Math.min(endValue??duration,duration)} onChange={e=>setEndValue(Number(e.target.value))} className="w-full accent-red-600"/></label>
     </>}

     <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
       <button type="button" onClick={playing?stop:preview} className="club-button-secondary">{playing?<Square size={17}/>:<Play size={17}/>} {playing?"Stop":"Ausschnitt testen"}</button>
       <button type="submit" className="club-button-primary sm:col-span-2"><Save size={17}/> Ausschnitt speichern</button>
     </div>
   </form>
   <p className="mt-3 text-xs text-zinc-600">Aktueller Ausschnitt: {startValue.toFixed(1)} s – {(endValue??duration).toFixed(1)} s · {Math.max(0,(endValue??duration)-startValue).toFixed(1)} Sekunden</p>
 </div>
}
