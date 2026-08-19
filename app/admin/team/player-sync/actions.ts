"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { discoverFussballPlayerProfiles } from "../../../../lib/fussball-player-sync";
import { isPlayingProfile } from "../../../../lib/player-role";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return supabase;
}

export async function importFussballBirthdays() {
  const supabase = await context();
  const { data, error } = await supabase
    .from("players")
    .select("id,first_name,last_name,birth_date,position,squad,is_active")
    .eq("is_active", true);
  if (error) throw new Error(`Spieler konnten nicht geladen werden: ${error.message}`);

  const players = (data ?? []).filter(isPlayingProfile);
  const result = await discoverFussballPlayerProfiles(players);
  const imports = result.matches.filter(
    (match) => match.status === "exact" && match.candidate?.birthDate && !match.player.birth_date,
  );

  let updated = 0;
  for (const match of imports) {
    const { error: updateError } = await supabase
      .from("players")
      .update({
        birth_date: match.candidate!.birthDate,
        fussball_profile_url: match.candidate!.profileUrl,
        fussball_user_id: match.candidate!.userId,
        fussball_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", match.player.id)
      .is("birth_date", null);
    if (!updateError) updated += 1;
  }

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team");
  revalidatePath("/admin/team/player-sync");
  revalidatePath("/admin/vereinszentrale");
  redirect(`/admin/team/player-sync?imported=${updated}&found=${result.profilesFound}`);
}
