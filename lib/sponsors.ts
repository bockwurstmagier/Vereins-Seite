import { createClient } from "./supabase/server";
export type PublicSponsor = { id:string; name:string; website_url:string|null; category:string; description:string|null; logo_url:string|null; sort_order:number };
export async function getActiveSponsors(): Promise<PublicSponsor[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0,10);
  const { data, error } = await supabase.from("sponsors").select("id,name,website_url,category,description,logo_url,sort_order").eq("is_active", true).or(`end_date.is.null,end_date.gte.${today}`).order("sort_order", {ascending:true}).order("name", {ascending:true});
  if (error) { console.error("Sponsoren konnten nicht geladen werden:", error); return []; }
  return data ?? [];
}
