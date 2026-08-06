"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "../../../../lib/auth/roles";
import {
  createInvitationToken,
  createRegistrationUrl,
} from "../../../../lib/player-invitations";
import { createClient } from "../../../../lib/supabase/server";

const ROLES = ["administrator", "vorstand", "trainer", "betreuer"] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function createInvitation(input: {
  playerId: string;
  invitedEmail?: string | null;
  phoneNumber?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const token = createInvitationToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await supabase
    .from("player_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("player_id", input.playerId)
    .is("accepted_at", null)
    .is("revoked_at", null);

  const { data, error } = await supabase
    .from("player_invitations")
    .insert({
      player_id: input.playerId,
      invited_email: input.invitedEmail || null,
      phone_number: input.phoneNumber || null,
      token,
      expires_at: expiresAt.toISOString(),
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `Einladung konnte nicht erstellt werden: ${error?.message ?? "Unbekannter Fehler"}`,
    );
  }

  return {
    invitationId: data.id as string,
    token,
    registrationUrl: createRegistrationUrl(token),
  };
}

export async function createPlayerInvitation(formData: FormData) {
  await requireRole([...ROLES]);

  const playerId = text(formData, "player_id");
  if (!playerId) throw new Error("Bitte einen Spieler auswählen.");

  const created = await createInvitation({
    playerId,
    invitedEmail: text(formData, "invited_email"),
    phoneNumber: text(formData, "phone_number"),
  });

  revalidatePath("/admin/spielerportal/einladungen");
  redirect(
    `/admin/spielerportal/einladungen?created=${created.invitationId}`,
  );
}

export async function renewPlayerInvitation(formData: FormData) {
  await requireRole([...ROLES]);
  const supabase = await createClient();

  const invitationId = text(formData, "invitation_id");

  const { data: existing, error } = await supabase
    .from("player_invitations")
    .select("player_id,invited_email,phone_number")
    .eq("id", invitationId)
    .single();

  if (error || !existing) {
    throw new Error("Einladung wurde nicht gefunden.");
  }

  await supabase
    .from("player_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", invitationId);

  const created = await createInvitation({
    playerId: existing.player_id,
    invitedEmail: existing.invited_email,
    phoneNumber: existing.phone_number,
  });

  revalidatePath("/admin/spielerportal/einladungen");
  redirect(
    `/admin/spielerportal/einladungen?created=${created.invitationId}`,
  );
}

export async function revokePlayerInvitation(formData: FormData) {
  await requireRole([...ROLES]);
  const supabase = await createClient();

  const invitationId = text(formData, "invitation_id");

  const { error } = await supabase
    .from("player_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", invitationId)
    .is("accepted_at", null);

  if (error) {
    throw new Error(`Einladung konnte nicht widerrufen werden: ${error.message}`);
  }

  revalidatePath("/admin/spielerportal/einladungen");
  redirect("/admin/spielerportal/einladungen?revoked=1");
}

export async function createInvitationsForOpenPlayers() {
  await requireRole([...ROLES]);
  const supabase = await createClient();

  const [{ data: players }, { data: accounts }] = await Promise.all([
    supabase
      .from("players")
      .select("id")
      .eq("is_active", true),
    supabase.from("player_accounts").select("player_id"),
  ]);

  const linked = new Set((accounts ?? []).map((entry) => entry.player_id));
  const openPlayers = (players ?? []).filter((player) => !linked.has(player.id));

  let created = 0;

  for (const player of openPlayers) {
    await createInvitation({
      playerId: player.id,
      invitedEmail: null,
      phoneNumber: null,
    });
    created += 1;
  }

  revalidatePath("/admin/spielerportal/einladungen");
  redirect(`/admin/spielerportal/einladungen?bulk=${created}`);
}
