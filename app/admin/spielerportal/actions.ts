"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";

export async function linkPlayerAccount(formData: FormData) {
  await requireRole(["administrator", "vorstand"]);
  const supabase = await createClient();

  const userId = String(formData.get("user_id") ?? "");
  const playerId = String(formData.get("player_id") ?? "");

  const { error } = await supabase
    .from("player_accounts")
    .upsert({ user_id: userId, player_id: playerId }, { onConflict: "user_id" });

  if (error) throw new Error(`Verknüpfung fehlgeschlagen: ${error.message}`);

  await supabase
    .from("user_profiles")
    .update({ role: "spieler", is_active: true })
    .eq("id", userId);

  revalidatePath("/admin/spielerportal");
  redirect("/admin/spielerportal?linked=1");
}

export async function createPlayerMessage(formData: FormData) {
  await requireRole(["administrator", "vorstand", "trainer", "betreuer"]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("player_messages").insert({
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    audience: String(formData.get("audience") ?? "all"),
    player_id: String(formData.get("player_id") ?? "").trim() || null,
    is_important: formData.get("is_important") === "on",
    created_by: user?.id ?? null,
  });

  if (error) throw new Error(`Nachricht konnte nicht erstellt werden: ${error.message}`);

  revalidatePath("/admin/spielerportal");
  redirect("/admin/spielerportal?message=1");
}
