"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";
const ROLES=["administrator","vorstand"] as const;
export async function saveGoalSound(formData:FormData){
 await requireRole([...ROLES]); const supabase=await createClient();
 const file=formData.get("goal_sound");
 if(!(file instanceof File)||!file.size) throw new Error("Bitte eine Sounddatei auswählen.");
 const allowed=["audio/mpeg","audio/wav","audio/x-wav","audio/ogg","audio/mp4","audio/aac"];
 if(!allowed.includes(file.type)&&!/\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name)) throw new Error("Erlaubt sind MP3, WAV, OGG, M4A oder AAC.");
 if(file.size>8*1024*1024) throw new Error("Der Tor-Sound darf maximal 8 MB groß sein.");
 const ext=(file.name.split(".").pop()||"mp3").replace(/[^a-z0-9]/gi,"").toLowerCase();
 const path=`goal/${crypto.randomUUID()}.${ext}`;
 const {error:uploadError}=await supabase.storage.from("match-sounds").upload(path,file,{contentType:file.type||"audio/mpeg",cacheControl:"3600",upsert:false});
 if(uploadError) throw new Error(`Sound konnte nicht hochgeladen werden: ${uploadError.message}`);
 const {data:pub}=supabase.storage.from("match-sounds").getPublicUrl(path);
 const {data:old}=await supabase.from("app_settings").select("value").eq("key","goal_sound").maybeSingle();
 const {error}=await supabase.from("app_settings").upsert({key:"goal_sound",value:{url:pub.publicUrl,path,name:file.name,start_seconds:0,end_seconds:null},updated_at:new Date().toISOString()},{onConflict:"key"});
 if(error){await supabase.storage.from("match-sounds").remove([path]);throw new Error(`Sound konnte nicht gespeichert werden: ${error.message}`);}
 const oldPath=old?.value?.path; if(oldPath&&oldPath!==path) await supabase.storage.from("match-sounds").remove([oldPath]);
 revalidatePath("/admin/einstellungen"); redirect("/admin/einstellungen?sound=updated");
}
export async function resetGoalSound(){
 await requireRole([...ROLES]); const supabase=await createClient();
 const {data:old}=await supabase.from("app_settings").select("value").eq("key","goal_sound").maybeSingle();
 await supabase.from("app_settings").delete().eq("key","goal_sound");
 if(old?.value?.path) await supabase.storage.from("match-sounds").remove([old.value.path]);
 revalidatePath("/admin/einstellungen"); redirect("/admin/einstellungen?sound=reset");
}

export async function saveGoalSoundTrim(formData:FormData){
 await requireRole([...ROLES]); const supabase=await createClient();
 const start=Math.max(0,Number(formData.get("start_seconds")||0));
 const rawEnd=String(formData.get("end_seconds")||"").trim();
 const end=rawEnd?Math.max(0,Number(rawEnd)):null;
 if(!Number.isFinite(start)||(end!==null&&!Number.isFinite(end))) throw new Error("Ungültiger Sound-Ausschnitt.");
 if(end!==null&&end<=start) throw new Error("Das Ende muss hinter dem Start liegen.");
 const {data:current,error:readError}=await supabase.from("app_settings").select("value").eq("key","goal_sound").maybeSingle();
 if(readError||!current?.value?.url) throw new Error("Bitte zuerst einen eigenen Tor-Sound hochladen.");
 const next={...current.value,start_seconds:start,end_seconds:end};
 const {error}=await supabase.from("app_settings").upsert({key:"goal_sound",value:next,updated_at:new Date().toISOString()},{onConflict:"key"});
 if(error) throw new Error(`Ausschnitt konnte nicht gespeichert werden: ${error.message}`);
 revalidatePath("/admin/einstellungen"); redirect("/admin/einstellungen?sound=trimmed");
}


export async function saveRefereeWhistle(formData:FormData){
 await requireRole([...ROLES]); const supabase=await createClient();
 const file=formData.get("referee_whistle");
 if(!(file instanceof File)||!file.size) throw new Error("Bitte eine Pfeifen-Sounddatei auswählen.");
 const allowed=["audio/mpeg","audio/wav","audio/x-wav","audio/ogg","audio/mp4","audio/aac"];
 if(!allowed.includes(file.type)&&!/\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name)) throw new Error("Erlaubt sind MP3, WAV, OGG, M4A oder AAC.");
 if(file.size>4*1024*1024) throw new Error("Der Pfeifen-Sound darf maximal 4 MB groß sein.");
 const ext=(file.name.split(".").pop()||"mp3").replace(/[^a-z0-9]/gi,"").toLowerCase();
 const path=`whistle/${crypto.randomUUID()}.${ext}`;
 const {error:uploadError}=await supabase.storage.from("match-sounds").upload(path,file,{contentType:file.type||"audio/mpeg",cacheControl:"3600",upsert:false});
 if(uploadError) throw new Error(`Pfeifen-Sound konnte nicht hochgeladen werden: ${uploadError.message}`);
 const {data:pub}=supabase.storage.from("match-sounds").getPublicUrl(path);
 const {data:old}=await supabase.from("app_settings").select("value").eq("key","referee_whistle").maybeSingle();
 const {error}=await supabase.from("app_settings").upsert({key:"referee_whistle",value:{url:pub.publicUrl,path,name:file.name,enabled:true},updated_at:new Date().toISOString()},{onConflict:"key"});
 if(error){await supabase.storage.from("match-sounds").remove([path]);throw new Error(`Pfeifen-Sound konnte nicht gespeichert werden: ${error.message}`);}
 if(old?.value?.path&&old.value.path!==path) await supabase.storage.from("match-sounds").remove([old.value.path]);
 revalidatePath("/admin/einstellungen"); redirect("/admin/einstellungen?whistle=updated");
}
export async function resetRefereeWhistle(){
 await requireRole([...ROLES]); const supabase=await createClient();
 const {data:old}=await supabase.from("app_settings").select("value").eq("key","referee_whistle").maybeSingle();
 await supabase.from("app_settings").delete().eq("key","referee_whistle");
 if(old?.value?.path) await supabase.storage.from("match-sounds").remove([old.value.path]);
 revalidatePath("/admin/einstellungen"); redirect("/admin/einstellungen?whistle=reset");
}
