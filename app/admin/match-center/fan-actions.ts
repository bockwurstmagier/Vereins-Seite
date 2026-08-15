"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/roles";
import { createAdminClient } from "../../../lib/supabase/admin";
import { finalizeFanPoll } from "../../../lib/fan-experience";

export async function startPlayerOfMatchPoll(formData: FormData) {
  await requireRole(["administrator", "trainer", "betreuer"]);
  const matchId = String(formData.get("match_id") ?? "").trim();
  const endsInHours = Number.parseInt(String(formData.get("ends_in_hours") ?? "6"), 10);
  const candidateIds = [...new Set(formData.getAll("candidate_ids").map(String).filter(Boolean))];

  if (!matchId) throw new Error("Spiel fehlt.");
  if (candidateIds.length < 2 || candidateIds.length > 6) {
    throw new Error("Bitte 2 bis 6 Spieler für die Abstimmung auswählen.");
  }
  if (![1, 3, 6, 12, 24].includes(endsInHours)) throw new Error("Ungültige Abstimmungsdauer.");
  const endsAt = new Date(Date.now() + endsInHours * 60 * 60 * 1000);

  const supabase = createAdminClient();
  const { data: match } = await supabase.from("matches").select("id,status").eq("id", matchId).maybeSingle();
  if (!match || match.status !== "finished") throw new Error("Das Voting kann erst nach Spielende gestartet werden.");

  const { data: squad } = await supabase.from("match_squad").select("player_id").eq("match_id", matchId);
  const allowed = new Set((squad ?? []).map((row) => row.player_id));
  if (candidateIds.some((id) => !allowed.has(id))) throw new Error("Ein ausgewählter Spieler gehört nicht zum Spieltagskader.");

  const { data: existing } = await supabase.from("fan_polls").select("id").eq("match_id", matchId).maybeSingle();
  let pollId: string;
  if (existing) {
    const { count } = await supabase.from("fan_poll_votes").select("id", { count: "exact", head: true }).eq("poll_id", existing.id);
    if ((count ?? 0) > 0) throw new Error("Für diese Abstimmung wurden bereits Stimmen abgegeben. Bitte zuerst beenden.");
    await supabase.from("fan_poll_candidates").delete().eq("poll_id", existing.id);
    await supabase.from("fan_polls").update({ status: "open", ends_at: endsAt.toISOString(), winner_player_id: null, closed_at: null }).eq("id", existing.id);
    pollId = existing.id;
  } else {
    const { data: poll, error } = await supabase.from("fan_polls").insert({ match_id: matchId, status: "open", ends_at: endsAt.toISOString() }).select("id").single();
    if (error || !poll) throw new Error(`Abstimmung konnte nicht erstellt werden: ${error?.message ?? "Unbekannter Fehler"}`);
    pollId = poll.id;
  }

  const { error: candidateError } = await supabase.from("fan_poll_candidates").insert(
    candidateIds.map((playerId, index) => ({ poll_id: pollId, player_id: playerId, sort_order: index })),
  );
  if (candidateError) throw new Error(`Kandidaten konnten nicht gespeichert werden: ${candidateError.message}`);

  revalidatePath("/");
  revalidatePath(`/admin/match-center/${matchId}`);
  redirect(`/admin/match-center/${matchId}?fanvote=started`);
}

export async function closePlayerOfMatchPoll(formData: FormData) {
  await requireRole(["administrator", "trainer", "betreuer"]);
  const matchId = String(formData.get("match_id") ?? "").trim();
  const pollId = String(formData.get("poll_id") ?? "").trim();
  if (!matchId || !pollId) throw new Error("Abstimmung fehlt.");
  await finalizeFanPoll(pollId);
  revalidatePath("/");
  revalidatePath("/statistiken");
  revalidatePath("/admin/statistiken");
  revalidatePath(`/admin/match-center/${matchId}`);
  redirect(`/admin/match-center/${matchId}?fanvote=closed`);
}
