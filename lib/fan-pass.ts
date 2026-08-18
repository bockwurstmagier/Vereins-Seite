import "server-only";
import { createAdminClient } from "./supabase/admin";
import { hashAnonymousId } from "./fan-experience";

export type FanBadge = { key:string; icon:string; title:string; description:string; unlocked:boolean };
export type FanLeaderboardEntry = { rank:number; displayName:string; points:number; levelName:string; isMe:boolean };
export type FanPassData = {
  displayName:string; points:number; level:number; levelName:string; nextLevelPoints:number;
  tips:number; exactTips:number; tendencyTips:number; votes:number; reactionMatches:number;
  badges:FanBadge[];
  rank:number; totalFans:number; leaderboard:FanLeaderboardEntry[];
};

const levels = [
  { min:0, name:"HUJA Rookie" }, { min:10, name:"Kurvenfreund" }, { min:25, name:"Matchday-Profi" },
  { min:50, name:"Stammgast" }, { min:100, name:"HUJA-Ultra" }, { min:200, name:"Vereinslegende" },
];

export function fanHash(deviceId:string){ return hashAnonymousId(deviceId,"fanpass:v1"); }

export async function getFanPass(deviceId:string):Promise<FanPassData>{
  const supabase=createAdminClient(); const hash=fanHash(deviceId);
  const [{data:profile},{data:tips},{data:votes},{data:reactions}] = await Promise.all([
    supabase.from("fan_profiles").select("display_name").eq("fan_hash",hash).maybeSingle(),
    supabase.from("match_predictions").select("points,is_exact,settled_at").eq("fan_hash",hash),
    supabase.from("fan_poll_votes").select("id").eq("fan_hash",hash),
    supabase.from("match_reactions").select("match_id").eq("fan_hash",hash),
  ]);
  const allTips=tips??[], settled=allTips.filter(x=>x.settled_at);
  const exactTips=settled.filter(x=>x.is_exact).length;
  const tendencyTips=settled.filter(x=>!x.is_exact && Number(x.points)===2).length;
  const votesCount=(votes??[]).length;
  const reactionMatches=new Set((reactions??[]).map(x=>x.match_id)).size;
  // Fanpunkte: Teilnahme am Tipp + erspielte Tipppunkte + Voting + aktive Live-Spieltage.
  const points=allTips.length + settled.reduce((s,x)=>s+Number(x.points??0),0) + votesCount*3 + reactionMatches*2;
  let levelIndex=0; for(let i=0;i<levels.length;i++) if(points>=levels[i].min) levelIndex=i;
  const next=levels[levelIndex+1]?.min ?? levels[levelIndex].min;
  const badges:FanBadge[]=[
    {key:"first_tip",icon:"⚽",title:"Erster Tipp",description:"Den ersten Matchday-Tipp abgegeben.",unlocked:allTips.length>=1},
    {key:"oracle",icon:"🎯",title:"Volltreffer",description:"Ein Ergebnis exakt vorhergesagt.",unlocked:exactTips>=1},
    {key:"tipper5",icon:"🏆",title:"Tipprunden-Profi",description:"Bei 5 Spielen mitgetippt.",unlocked:allTips.length>=5},
    {key:"voice",icon:"🗳️",title:"Fan-Stimme",description:"Spieler des Spiels gewählt.",unlocked:votesCount>=1},
    {key:"live",icon:"🔥",title:"Live dabei",description:"Während eines Live-Spiels reagiert.",unlocked:reactionMatches>=1},
    {key:"regular",icon:"🔴",title:"Stammgast",description:"50 HUJA-Fanpunkte gesammelt.",unlocked:points>=50},
  ];
  const { data: profiles } = await supabase.from("fan_profiles").select("fan_hash,display_name");
  const [{data:allPredictions},{data:allVotes},{data:allReactions}] = await Promise.all([
    supabase.from("match_predictions").select("fan_hash,points,settled_at"),
    supabase.from("fan_poll_votes").select("fan_hash"),
    supabase.from("match_reactions").select("fan_hash,match_id"),
  ]);
  const score=new Map<string,number>();
  for(const x of allPredictions??[]){ if(!x.fan_hash) continue; score.set(x.fan_hash,(score.get(x.fan_hash)??0)+1+(x.settled_at?Number(x.points??0):0)); }
  for(const x of allVotes??[]){ if(x.fan_hash) score.set(x.fan_hash,(score.get(x.fan_hash)??0)+3); }
  const reactionDays=new Map<string,Set<string>>();
  for(const x of allReactions??[]){ if(!x.fan_hash) continue; if(!reactionDays.has(x.fan_hash)) reactionDays.set(x.fan_hash,new Set()); reactionDays.get(x.fan_hash)!.add(x.match_id); }
  for(const [h,matches] of reactionDays) score.set(h,(score.get(h)??0)+matches.size*2);
  const nameMap=new Map((profiles??[]).map(x=>[x.fan_hash,x.display_name||"HUJA-Fan"]));
  if(!nameMap.has(hash)) nameMap.set(hash,profile?.display_name??"HUJA-Fan");
  const board=[...nameMap.keys()].map(h=>({hash:h,displayName:nameMap.get(h)!,points:score.get(h)??0}))
    .sort((a,b)=>b.points-a.points || a.displayName.localeCompare(b.displayName,"de"));
  const levelFor=(p:number)=>{let n=levels[0].name;for(const l of levels)if(p>=l.min)n=l.name;return n};
  const myIndex=Math.max(0,board.findIndex(x=>x.hash===hash));
  const leaderboard=board.slice(0,10).map((x,i)=>({rank:i+1,displayName:x.displayName,points:x.points,levelName:levelFor(x.points),isMe:x.hash===hash}));
  const rank=myIndex+1;
  return {displayName:profile?.display_name??"HUJA-Fan",points,level:levelIndex+1,levelName:levels[levelIndex].name,nextLevelPoints:next,tips:allTips.length,exactTips,tendencyTips,votes:votesCount,reactionMatches,badges,rank,totalFans:board.length,leaderboard};
}

export async function saveFanName(deviceId:string,displayName:string){
 const supabase=createAdminClient(); const hash=fanHash(deviceId);
 const name=displayName.trim().slice(0,30)||"HUJA-Fan";
 const {error}=await supabase.from("fan_profiles").upsert({fan_hash:hash,display_name:name,updated_at:new Date().toISOString()},{onConflict:"fan_hash"});
 if(error) throw error; return name;
}
