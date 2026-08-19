import { Cake, PartyPopper } from "lucide-react";
import { createClient } from "../../lib/supabase/server";
import { isPlayingProfile } from "../../lib/player-role";

function berlinMonthDay() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${month}-${day}`;
}

export default async function BirthdaySpotlight() {
  const supabase = await createClient();
  const { data } = await supabase.from("players").select("id,first_name,last_name,birth_date,image_url,position,squad,is_active").eq("is_active", true).not("birth_date", "is", null);
  const today = berlinMonthDay();
  const birthdays = (data ?? []).filter(isPlayingProfile).filter((p) => p.birth_date?.slice(5) === today);
  if (!birthdays.length) return null;
  return <section className="club-section py-5"><div className="club-container"><div className="club-card overflow-hidden border-club-light-red/25 bg-gradient-to-br from-club-burgundy/70 via-black to-black p-5 sm:p-6">
    <p className="club-eyebrow flex items-center gap-2"><Cake size={15}/> Geburtstag bei HUJA</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">{birthdays.map((player)=><div key={player.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-club-light-red/20 bg-club-red/20">{player.image_url?<img src={player.image_url} alt="" className="h-full w-full object-cover object-top"/>:<div className="grid h-full place-items-center"><PartyPopper className="text-club-light-red"/></div>}</div>
      <div><p className="text-xs font-black uppercase tracking-wider text-club-light-red">Alles Gute! 🎂</p><h2 className="mt-1 text-xl font-black uppercase text-white">{player.first_name} {player.last_name}</h2><p className="mt-1 text-xs text-zinc-500">Die HUJA-Familie gratuliert zum Geburtstag.</p></div>
    </div>)}</div>
  </div></div></section>;
}
