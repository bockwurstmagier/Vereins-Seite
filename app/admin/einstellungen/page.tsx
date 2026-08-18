import { Music2, RotateCcw, Upload } from "lucide-react";
import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";
import { resetGoalSound, saveGoalSound } from "./actions";
export default async function Page({searchParams}:{searchParams:Promise<{sound?:string}>}){
 await requireRole(["administrator","vorstand"]);
 const supabase=await createClient(); const {data}=await supabase.from("app_settings").select("value").eq("key","goal_sound").maybeSingle();
 const current=data?.value as {url?:string;name?:string}|undefined; const q=await searchParams;
 return <div className="mx-auto max-w-6xl"><p className="club-eyebrow">Vereinsmanager</p><h1 className="club-heading mt-2">Einstellungen</h1>
  {q.sound&&<div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-300">{q.sound==="updated"?"Tor-Sound gespeichert.":"Standard-Tor-Sound wiederhergestellt."}</div>}
  <div className="club-card mt-8 overflow-hidden"><div className="border-b border-white/10 bg-gradient-to-r from-club-burgundy/60 to-transparent p-6"><div className="flex items-center gap-3"><Music2 className="text-club-light-red"/><div><p className="club-eyebrow">HUJA Match Experience</p><h2 className="mt-1 text-xl font-black uppercase text-white">Eigener Tor-Sound</h2></div></div><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Lade euren eigenen HUJA-Torjubel hoch. Dieser Sound wird bei neuen Toren im öffentlichen LiveCenter verwendet, wenn der Fan den Live-Sound aktiviert hat.</p></div>
   <div className="p-6">{current?.url?<div className="mb-6 rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-xs font-black uppercase tracking-wider text-zinc-500">Aktuell</p><p className="mt-1 font-black text-white">{current.name||"Eigener HUJA Tor-Sound"}</p><audio controls preload="metadata" src={current.url} className="mt-3 w-full"/></div>:<div className="mb-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-400">Aktuell wird der HUJA Standard-Tor-Sound verwendet.</div>}
   <form action={saveGoalSound} className="space-y-4"><label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">Neue Sounddatei</span><input required name="goal_sound" type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac,.mp3,.wav,.ogg,.m4a,.aac" className="block w-full rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-300 file:mr-4 file:rounded-xl file:border-0 file:bg-club-red file:px-4 file:py-2 file:font-black file:text-white"/></label><p className="text-xs text-zinc-600">MP3, WAV, OGG, M4A oder AAC · maximal 8 MB.</p><button className="club-button-primary"><Upload size={17}/> Tor-Sound hochladen</button></form>
   {current?.url&&<form action={resetGoalSound} className="mt-3"><button className="club-button-secondary"><RotateCcw size={17}/> Standard wiederherstellen</button></form>}
   </div></div></div>
}
