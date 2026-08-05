"use client";import {useMemo,useState} from "react";import {Copy,Sparkles} from "lucide-react";
export default function TextAssistant(){const [score,setScore]=useState("2:1"),[opponent,setOpponent]=useState("Gegner"),[scorers,setScorers]=useState(""),[tone,setTone]=useState("emotional");const out=useMemo(()=>`HUJA! 🔴⚫

Unsere Jungs gewinnen ${score} gegen ${opponent}! ${tone==="emotional"?"Mit Leidenschaft, Einsatz und echtem Teamgeist haben wir bis zum Schluss alles gegeben.":"Eine konzentrierte Leistung bringt uns den verdienten Erfolg."}${scorers?`

Torschützen: ${scorers}`:""}

Gemeinsam weiter – die Middelicher sind da!

#HUJA #MiddelichResse #DieMiddelicherSindDa`,[score,opponent,scorers,tone]);return <div className="grid gap-6 lg:grid-cols-2"><div className="club-card grid gap-4 p-5"><input value={opponent} onChange={e=>setOpponent(e.target.value)} className="admin-input" placeholder="Gegner"/><input value={score} onChange={e=>setScore(e.target.value)} className="admin-input" placeholder="Ergebnis"/><input value={scorers} onChange={e=>setScorers(e.target.value)} className="admin-input" placeholder="Torschützen"/><select value={tone} onChange={e=>setTone(e.target.value)} className="admin-input"><option value="emotional">Emotional</option><option value="sachlich">Sachlich</option></select></div><div className="club-card p-5"><div className="flex items-center gap-2"><Sparkles size={18} className="text-club-light-red"/><p className="club-eyebrow">Vorschlag</p></div><pre className="mt-5 whitespace-pre-wrap font-sans leading-7 text-zinc-300">{out}</pre><button onClick={()=>navigator.clipboard.writeText(out)} className="club-button-primary mt-5 w-full"><Copy size={18}/>Text kopieren</button></div></div>}
