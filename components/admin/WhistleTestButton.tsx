"use client";
import { Volume2 } from "lucide-react";
import { playStadiumWhistle } from "../match-center/StadiumWhistle";
export default function WhistleTestButton(){
 return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
  <button type="button" onClick={()=>void playStadiumWhistle(1)} className="club-button-secondary min-h-12"><Volume2 size={16}/>1× Anpfiff</button>
  <button type="button" onClick={()=>void playStadiumWhistle(2)} className="club-button-secondary min-h-12"><Volume2 size={16}/>2× Halbzeit</button>
  <button type="button" onClick={()=>void playStadiumWhistle(1)} className="club-button-secondary min-h-12"><Volume2 size={16}/>1× 2. HZ</button>
  <button type="button" onClick={()=>void playStadiumWhistle(3)} className="club-button-secondary min-h-12"><Volume2 size={16}/>3× Abpfiff</button>
 </div>
}