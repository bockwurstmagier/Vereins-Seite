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
 const {error}=await supabase.from("app_settings").upsert({key:"goal_sound",value:{url:pub.publicUrl,path,name:file.name},updated_at:new Date().toISOString()},{onConflict:"key"});
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
