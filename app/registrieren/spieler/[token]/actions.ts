"use server";

import { redirect } from "next/navigation";

import { createAdminClient, getAdminSupabaseConfigStatus } from "../../../../lib/supabase/admin";
import { createClient } from "../../../../lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function registerInvitedPlayer(formData: FormData) {
  const token = value(formData, "token");
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");
  const passwordRepeat = value(formData, "password_repeat");

  if (!email || !email.includes("@")) {
    redirect(`/registrieren/spieler/${token}?error=email`);
  }

  if (password.length < 8) {
    redirect(`/registrieren/spieler/${token}?error=password`);
  }

  if (password !== passwordRepeat) {
    redirect(`/registrieren/spieler/${token}?error=repeat`);
  }

  const adminConfig = getAdminSupabaseConfigStatus();
  if (!adminConfig.ok) {
    console.error(
      "HUJA Spielerregistrierung: Serverkonfiguration unvollständig:",
      adminConfig.missing.join(", "),
    );
    redirect(`/registrieren/spieler/${token}?error=config`);
  }

  const admin = createAdminClient();

  const { data: invitation, error: invitationError } = await admin
    .from("player_invitations")
    .select(
      "id,player_id,invited_email,expires_at,accepted_at,revoked_at,players(first_name,last_name)",
    )
    .eq("token", token)
    .maybeSingle();

  if (invitationError || !invitation) {
    redirect(`/registrieren/spieler/${token}?error=invalid`);
  }

  if (
    invitation.accepted_at ||
    invitation.revoked_at ||
    new Date(invitation.expires_at).getTime() < Date.now()
  ) {
    redirect(`/registrieren/spieler/${token}?error=expired`);
  }

  if (
    invitation.invited_email &&
    invitation.invited_email.toLowerCase() !== email
  ) {
    redirect(`/registrieren/spieler/${token}?error=email_mismatch`);
  }

  const playerName = Array.isArray(invitation.players)
    ? invitation.players[0]
    : invitation.players;

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: playerName
          ? `${playerName.first_name} ${playerName.last_name}`
          : "Spieler",
      },
    });

  if (createError || !created.user) {
    const code = createError?.message.toLowerCase().includes("already")
      ? "exists"
      : "create";
    redirect(`/registrieren/spieler/${token}?error=${code}`);
  }

  const userId = created.user.id;

  try {
    const { error: profileError } = await admin.from("user_profiles").upsert({
      id: userId,
      email,
      display_name: playerName
        ? `${playerName.first_name} ${playerName.last_name}`
        : email,
      role: "spieler",
      is_active: true,
    });

    if (profileError) throw profileError;

    const { error: linkError } = await admin.from("player_accounts").insert({
      user_id: userId,
      player_id: invitation.player_id,
    });

    if (linkError) throw linkError;

    const { error: invitationUpdateError } = await admin
      .from("player_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id)
      .is("accepted_at", null);

    if (invitationUpdateError) throw invitationUpdateError;
  } catch (error) {
    await admin.auth.admin.deleteUser(userId);
    console.error("Spielerregistrierung wurde zurückgerollt:", error);
    redirect(`/registrieren/spieler/${token}?error=database`);
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    redirect("/login?registered=1");
  }

  redirect("/spielerportal?welcome=1");
}
