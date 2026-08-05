"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "../../../lib/auth/roles";
import type { ImportedMatch } from "../../../lib/dfbnet/csv-parser";
import { rebuildStandings } from "../../../lib/dfbnet/standings";
import { createClient } from "../../../lib/supabase/server";

const ALLOWED_ROLES = ["administrator", "vorstand"] as const;

type ImportPayload = {
  season: string;
  clubName: string;
  matches: ImportedMatch[];
};

export async function importDfbnetSeason(formData: FormData) {
  await requireRole([...ALLOWED_ROLES]);

  const rawPayload = String(formData.get("payload") ?? "");
  if (!rawPayload) throw new Error("Die Importdaten fehlen.");

  const payload = JSON.parse(rawPayload) as ImportPayload;

  if (!payload.season || !payload.clubName || !payload.matches.length) {
    throw new Error("Der Saisonimport ist unvollständig.");
  }

  if (payload.matches.length > 1000) {
    throw new Error("Maximal 1000 Spiele pro Import sind erlaubt.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const now = new Date().toISOString();
  const rows = payload.matches.map((match) => ({
    import_key: match.importKey,
    source: "dfbnet_csv",
    source_match_id: match.sourceMatchId,
    season: match.season,
    competition: match.competition,
    matchday: match.matchday,
    home_team: match.homeTeam,
    away_team: match.awayTeam,
    match_date: match.matchDateIso,
    location: match.location,
    maps_query: match.mapsQuery,
    status: match.status,
    home_score: match.homeScore,
    away_score: match.awayScore,
    imported_at: now,
    updated_at: now,
  }));

  const { error } = await supabase
    .from("matches")
    .upsert(rows, { onConflict: "import_key" });

  if (error) {
    throw new Error(`Spielplan konnte nicht importiert werden: ${error.message}`);
  }

  const competitions = [...new Set(payload.matches.map((match) => match.competition))];
  let tableTeams = 0;

  for (const competition of competitions) {
    tableTeams += await rebuildStandings({
      supabase,
      season: payload.season,
      competition,
      clubName: payload.clubName,
    });
  }

  await supabase.from("season_imports").insert({
    season: payload.season,
    source: "dfbnet_csv",
    imported_matches: payload.matches.length,
    competitions,
    imported_by: user.id,
  });

  revalidatePath("/");
  revalidatePath("/spielplan");
  revalidatePath("/tabelle");
  revalidatePath("/statistiken");
  revalidatePath("/admin");
  revalidatePath("/admin/spiele");
  revalidatePath("/admin/tabelle");
  revalidatePath("/admin/saisonimport");

  redirect(
    `/admin/saisonimport?success=1&matches=${payload.matches.length}&teams=${tableTeams}`,
  );
}
