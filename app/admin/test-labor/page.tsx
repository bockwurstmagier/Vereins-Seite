import { Beaker } from "lucide-react";
import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";
import { isPlayingProfile } from "../../../lib/player-role";
import TestLabSimulator from "../../../components/admin/TestLabSimulator";

export default async function TestLaborPage(){
 await requireRole(["administrator"]);
 const supabase=await createClient();
 const {data}=await supabase.from("players").select("id, first_name, last_name, shirt_number, position, squad, image_url").eq("is_active",true);
 const players=(data??[]).filter(isPlayingProfile).map(p=>({id:p.id,first_name:p.first_name,last_name:p.last_name,shirt_number:p.shirt_number}));
 return <div className="mx-auto max-w-4xl"><div className="mb-6 flex items-center gap-4"><span className="club-icon-box"><Beaker size={22}/></span><div><p className="club-eyebrow">Administrator only</p><h1 className="text-2xl font-black uppercase text-white">HUJA Test-Labor</h1><p className="mt-1 text-sm text-zinc-500">LiveCenter und Live-Regie gefahrlos simulieren, ohne echte Nutzer zu stören.</p></div></div><TestLabSimulator players={players}/></div>
}