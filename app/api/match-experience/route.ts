import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  const supabase=createAdminClient();
  const {data}=await supabase.from("app_settings").select("value").eq("key","goal_sound").maybeSingle();
  const {data:whistle}=await supabase.from("app_settings").select("value").eq("key","referee_whistle").maybeSingle();
  return NextResponse.json({
    goalSoundUrl:data?.value?.url??"/sounds/goal.wav",
    goalSoundStart:Number(data?.value?.start_seconds??0),
    goalSoundEnd:data?.value?.end_seconds!=null?Number(data.value.end_seconds):null,
    refereeWhistleUrl:whistle?.value?.url??null,
  },{headers:{"Cache-Control":"no-store, max-age=0"}});
 }catch{return NextResponse.json({goalSoundUrl:"/sounds/goal.wav",goalSoundStart:0,goalSoundEnd:null,refereeWhistleUrl:null});}
}
