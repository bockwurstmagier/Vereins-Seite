"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateMediaCenterPackage } from "../../../lib/ai/media-center";
import { requireRole } from "../../../lib/auth/roles";
import type {
  FinalizerEvent,
  FinalizerMatch,
  FinalizerPlayer,
} from "../../../lib/match-day-finalizer";
import { createClient } from "../../../lib/supabase/server";

export async function generateAiMediaPackage(formData: FormData) {
  await requireRole([
    "administrator",
    "vorstand",
    "trainer",
    "social_media",
    "betreuer",
  ]);

  const matchId = String(formData.get("match_id") ?? "").trim();
  const tone = String(formData.get("tone") ?? "emotional").trim();
  const extraNote = String(formData.get("extra_note") ?? "").trim();

  if (!matchId) throw new Error("Bitte ein Spiel auswählen.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [matchResult, eventsResult, playersResult] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id,competition,matchday,season,home_team,away_team,home_score,away_score,current_minute,player_of_match_id,finalized_at",
      )
      .eq("id", matchId)
      .single(),
    supabase
      .from("match_events")
      .select(
        "event_type,minute,player_id,secondary_player_id,description",
      )
      .eq("match_id", matchId)
      .order("minute", { ascending: true }),
    supabase
      .from("players")
      .select("id,first_name,last_name"),
  ]);

  if (matchResult.error || !matchResult.data) {
    throw new Error("Das Spiel konnte nicht geladen werden.");
  }
  if (eventsResult.error) throw new Error(eventsResult.error.message);
  if (playersResult.error) throw new Error(playersResult.error.message);

  const generated = await generateMediaCenterPackage({
    match: matchResult.data as FinalizerMatch,
    events: (eventsResult.data ?? []) as FinalizerEvent[],
    players: (playersResult.data ?? []) as FinalizerPlayer[],
    tone,
    extraNote,
  });

  const { data, error } = await supabase
    .from("media_center_packages")
    .insert({
      match_id: matchId,
      tone,
      source: generated.source,
      model: null,
      package: generated.package,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `Medienpaket konnte nicht gespeichert werden: ${
        error?.message ?? "Unbekannter Fehler"
      }`,
    );
  }

  revalidatePath("/admin/mediencenter");
  redirect(`/admin/mediencenter?package=${data.id}&match=${matchId}`);
}
