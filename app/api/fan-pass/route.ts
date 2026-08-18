import { NextResponse } from "next/server";
import { getFanPass, saveFanName } from "../../../lib/fan-pass";
function valid(id:string){return id.length>=12&&id.length<=160}
export async function POST(request:Request){
 try{
  const body=await request.json(); const deviceId=String(body.deviceId??"");
  if(!valid(deviceId)) return NextResponse.json({error:"Ungültiger Fanpass."},{status:400});
  if(body.action==="rename") await saveFanName(deviceId,String(body.displayName??""));
  return NextResponse.json({ok:true,data:await getFanPass(deviceId)});
 }catch(error){console.error("HUJA Fanpass:",error);return NextResponse.json({error:"Fanpass konnte nicht geladen werden."},{status:500})}
}
