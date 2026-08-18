import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  const supabase=createAdminClient();
  const {data}=await supabase.from("app_settings").select("value").eq("key","goal_sound").maybeSingle();
  return NextResponse.json({goalSoundUrl:data?.value?.url??"/sounds/goal.wav"},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({goalSoundUrl:"/sounds/goal.wav"});}
}
