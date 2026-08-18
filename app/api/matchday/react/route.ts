import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { hashAnonymousId } from "../../../../lib/fan-experience";
const allowed = new Set(["🔥","❤️","👏","⚽"]);
export async function POST(request: Request) {
  try {
    const body = await request.json(); const matchId=String(body.matchId??""); const deviceId=String(body.deviceId??""); const reaction=String(body.reaction??"");
    if(!matchId || deviceId.length<12 || !allowed.has(reaction)) return NextResponse.json({error:"Ungültige Reaktion."},{status:400});
    const supabase=createAdminClient(); const {data:match}=await supabase.from("matches").select("status").eq("id",matchId).maybeSingle();
    if(!match || match.status!=="live") return NextResponse.json({error:"Reaktionen sind nur während des Live-Spiels möglich."},{status:409});
    const voterHash=hashAnonymousId(deviceId,`reaction:${matchId}:${reaction}`);
    const {error}=await supabase.from("match_reactions").insert({match_id:matchId,voter_hash:voterHash,reaction});
    if(error?.code==="23505") return NextResponse.json({error:"Diese Reaktion hast du bereits gesendet."},{status:409});
    if(error) throw error;
    const {data}=await supabase.from("match_reactions").select("reaction").eq("match_id",matchId); const counts:Record<string,number>={}; for(const r of data??[]) counts[r.reaction]=(counts[r.reaction]??0)+1;
    return NextResponse.json({ok:true,counts});
  } catch(error){console.error("Matchday-Reaktion:",error);return NextResponse.json({error:"Reaktion konnte nicht gespeichert werden."},{status:500});}
}
