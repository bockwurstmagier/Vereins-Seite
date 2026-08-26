"use client";
import { useEffect, useRef } from "react";

export function playSyntheticWhistle(count:number){
 const Ctx=window.AudioContext||(window as typeof window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 if(!Ctx)return;
 const ctx=new Ctx();
 const now=ctx.currentTime+.03;
 for(let i=0;i<count;i++){
  const start=now+i*.48;
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type="square";osc.frequency.setValueAtTime(3050,start);osc.frequency.linearRampToValueAtTime(3300,start+.2);
  gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.12,start+.025);gain.gain.exponentialRampToValueAtTime(.0001,start+.3);
  osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+.32);
 }
 window.setTimeout(()=>void ctx.close(),Math.max(1200,count*500+500));
}
export async function playStadiumWhistle(count:number){
 let url:string|null=null;
 try{const r=await fetch(`/api/match-experience?t=${Date.now()}`,{cache:"no-store"});const x=await r.json();url=x.refereeWhistleUrl??null}catch{}
 if(!url){playSyntheticWhistle(count);return}
 for(let i=0;i<count;i++)window.setTimeout(()=>{const a=new Audio(url!);a.volume=.8;void a.play().catch(()=>playSyntheticWhistle(1))},i*520);
}
export default function StadiumWhistle({status,clockPhase}:{status:"scheduled"|"live"|"finished";clockPhase:string|null}){
 const prevStatus=useRef(status),prevPhase=useRef(clockPhase);
 useEffect(()=>{
  let count=0;
  if(prevStatus.current==="scheduled"&&status==="live")count=1;
  else if(prevPhase.current!=="halftime"&&clockPhase==="halftime")count=2;
  else if(prevPhase.current==="halftime"&&clockPhase==="second_half")count=1;
  else if(prevStatus.current!=="finished"&&status==="finished")count=3;
  prevStatus.current=status;prevPhase.current=clockPhase;
  if(count&&window.localStorage.getItem("huja-live-sound")==="true")void playStadiumWhistle(count);
 },[status,clockPhase]);
 return null;
}
