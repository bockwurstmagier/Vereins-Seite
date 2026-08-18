import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { hashAnonymousId } from "../../../../lib/fan-experience";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const matchId = String(body.matchId ?? ""); const deviceId = String(body.deviceId ?? "");
    const displayName = String(body.displayName ?? "HUJA-Fan").trim().slice(0,30) || "HUJA-Fan";
    const homeScore = Number(body.homeScore); const awayScore = Number(body.awayScore);
    if (!matchId || deviceId.length < 12 || !Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0 || homeScore > 30 || awayScore > 30) return NextResponse.json({error:"Ungültiger Tipp."},{status:400});
    const supabase = createAdminClient();
    const { data: match } = await supabase.from("matches").select("id,status,match_date").eq("id",matchId).maybeSingle();
    if (!match) return NextResponse.json({error:"Spiel nicht gefunden."},{status:404});
    if (match.status !== "scheduled" || new Date(match.match_date).getTime() <= Date.now()) return NextResponse.json({error:"Die Tippabgabe ist bereits geschlossen."},{status:409});
    const voterHash = hashAnonymousId(deviceId, `prediction:${matchId}`);
    const fanHash = hashAnonymousId(deviceId, "fanpass:v1");
    const { error } = await supabase.from("match_predictions").upsert({match_id:matchId,voter_hash:voterHash,fan_hash:fanHash,display_name:displayName,home_score:homeScore,away_score:awayScore,updated_at:new Date().toISOString()},{onConflict:"match_id,voter_hash"});
    if (error) throw error;
    return NextResponse.json({ok:true});
  } catch (error) { console.error("Matchday-Tipp:",error); return NextResponse.json({error:"Tipp konnte nicht gespeichert werden."},{status:500}); }
}
