import "server-only";

import { createClient } from "./supabase/server";

export type AssistantPhase =
  | "countdown"
  | "first_half"
  | "paused"
  | "halftime"
  | "second_half"
  | "postgame"
  | "completed";

export type AssistantEvent = {
  id: string;
  event_type: string;
  minute: number;
  player_id: string | null;
  secondary_player_id: string | null;
  description: string | null;
  video_url: string | null;
  is_highlight: boolean | null;
  created_at: string;
};

export type MatchdayAssistantData = {
  match: {
    id: string;
    competition: string;
    matchday: string | null;
    home_team: string;
    away_team: string;
    match_date: string;
    location: string | null;
    home_score: number | null;
    away_score: number | null;
    status: "scheduled" | "live" | "finished";
    current_minute: number | null;
    clock_phase: string | null;
    finalized_at: string | null;
  };
  phase: AssistantPhase;
  events: AssistantEvent[];
  playerNames: Record<string,string>;
  squadCount: number;
  outputReady: boolean;
  newsId: string | null;
  fanPoll: { id:string; status:string; ends_at:string; winner_player_id:string|null } | null;
  stats: { goals:number; cards:number; substitutions:number; videos:number; highlights:number };
};

export async function getMatchdayAssistantData(): Promise<MatchdayAssistantData | null> {
  const supabase=await createClient();
  const {data:matches,error}=await supabase.from("matches").select(
    "id,competition,matchday,home_team,away_team,match_date,location,home_score,away_score,status,current_minute,clock_phase,finalized_at"
  ).or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%").order("match_date",{ascending:false}).limit(60);
  if(error||!matches?.length) return null;
  const now=Date.now();
  const live=matches.find(m=>m.status==="live");
  const upcoming=[...matches].filter(m=>m.status==="scheduled"&&new Date(m.match_date).getTime()>=now-2*60*60*1000).sort((a,b)=>new Date(a.match_date).getTime()-new Date(b.match_date).getTime())[0];
  const recentFinished=matches.find(m=>m.status==="finished"&&now-new Date(m.match_date).getTime()<36*60*60*1000);
  const match=(live??upcoming??recentFinished??matches[0]) as MatchdayAssistantData["match"];
  const [eventsRes,playersRes,squadRes,outputRes,pollRes]=await Promise.all([
    supabase.from("match_events").select("id,event_type,minute,player_id,secondary_player_id,description,video_url,is_highlight,created_at").eq("match_id",match.id).order("minute",{ascending:true}).order("created_at",{ascending:true}),
    supabase.from("players").select("id,first_name,last_name").eq("is_active",true),
    supabase.from("match_squad").select("id",{count:"exact",head:true}).eq("match_id",match.id),
    supabase.from("match_day_outputs").select("id,news_id").eq("match_id",match.id).maybeSingle(),
    supabase.from("fan_polls").select("id,status,ends_at,winner_player_id").eq("match_id",match.id).maybeSingle(),
  ]);
  const events=(eventsRes.data??[]) as AssistantEvent[];
  const playerNames=Object.fromEntries((playersRes.data??[]).map(p=>[p.id,`${p.first_name} ${p.last_name}`]));
  const outputReady=Boolean(outputRes.data?.id);
  let phase:AssistantPhase="countdown";
  if(match.status==="finished") phase=outputReady?"completed":"postgame";
  else if(match.status==="live") {
    if(match.clock_phase==="halftime") phase="halftime";
    else if(match.clock_phase==="second_half") phase="second_half";
    else if(match.clock_phase==="paused") phase="paused";
    else phase="first_half";
  }
  return {
    match,phase,events,playerNames,squadCount:squadRes.count??0,outputReady,
    newsId:outputRes.data?.news_id??null,
    fanPoll:pollRes.data??null,
    stats:{
      goals:events.filter(e=>e.event_type==="goal").length,
      cards:events.filter(e=>e.event_type==="yellow_card"||e.event_type==="red_card").length,
      substitutions:events.filter(e=>e.event_type==="substitution").length,
      videos:events.filter(e=>Boolean(e.video_url)).length,
      highlights:events.filter(e=>Boolean(e.video_url)&&Boolean(e.is_highlight)).length,
    }
  };
}

export function assistantGoalLines(data:MatchdayAssistantData){
 return data.events.filter(e=>e.event_type==="goal").map(e=>{
   const scorer=e.player_id?data.playerNames[e.player_id]:null;
   const assist=e.secondary_player_id?data.playerNames[e.secondary_player_id]:null;
   return `${e.minute}'. ${scorer||e.description||"Tor"}${assist?` (Vorlage: ${assist})`:""}`;
 });
}
