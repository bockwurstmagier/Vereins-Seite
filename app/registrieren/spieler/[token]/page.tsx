import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import vereinsLogo from "../../../logo.png";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { registerInvitedPlayer } from "./actions";

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function PlayerRegistrationPage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  const { error } = await searchParams;
  const admin = createAdminClient();

  const { data: invitation } = await admin
    .from("player_invitations")
    .select(
      "id,player_id,invited_email,expires_at,accepted_at,revoked_at,players(first_name,last_name,position,squad,image_url)",
    )
    .eq("token", token)
    .maybeSingle();

  const invalid =
    !invitation ||
    invitation.accepted_at ||
    invitation.revoked_at ||
    new Date(invitation.expires_at).getTime() < Date.now();

  const player = invitation
    ? Array.isArray(invitation.players)
      ? invitation.players[0]
      : invitation.players
    : null;

  return (
    <main className="min-h-screen bg-club-black px-4 py-10 text-white">
      <div className="mx-auto max-w-lg">
        <Image src={vereinsLogo} alt="" className="mx-auto w-28" />

        <section className="club-card mt-7 overflow-hidden">
          <div className="border-b border-white/10 bg-gradient-to-r from-club-burgundy/60 via-club-dark-red/20 to-transparent p-6 text-center">
            <p className="club-eyebrow">HUJA Spielerportal</p>
            <h1 className="mt-2 text-2xl font-black uppercase">
              Konto erstellen
            </h1>
          </div>

          {invalid ? (
            <div className="p-6 text-center">
              <Clock3 size={42} className="mx-auto text-red-300" />
              <h2 className="mt-4 text-xl font-black uppercase">
                Einladung nicht mehr gültig
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Der Link ist abgelaufen, wurde widerrufen oder bereits benutzt.
                Bitte fordere beim Trainerteam eine neue Einladung an.
              </p>
              <Link href="/login" className="club-button-secondary mt-6 w-full">
                Zur Anmeldung
              </Link>
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-5 text-center">
                {player?.image_url ? (
                  <img
                    src={player.image_url}
                    alt=""
                    className="mx-auto h-24 w-24 rounded-3xl object-cover object-top"
                  />
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-club-red/10 text-club-light-red">
                    <UserRound size={40} />
                  </div>
                )}
                <p className="mt-4 text-lg font-black">
                  {player
                    ? `${player.first_name} ${player.last_name}`
                    : "Spieler"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {player?.position ?? "Mannschaft"}
                  {player?.squad ? ` · ${player.squad}` : ""}
                </p>
              </div>

              {error && <ErrorMessage code={error} />}

              <form action={registerInvitedPlayer} className="mt-6 space-y-4">
                <input type="hidden" name="token" value={token} />

                <label>
                  <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    <Mail size={14} />
                    E-Mail
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    readOnly={Boolean(invitation?.invited_email)}
                    defaultValue={invitation?.invited_email ?? ""}
                    placeholder="deine@email.de"
                    className="admin-input"
                  />
                </label>

                <label>
                  <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    <LockKeyhole size={14} />
                    Passwort
                  </span>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="admin-input"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Passwort wiederholen
                  </span>
                  <input
                    name="password_repeat"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="admin-input"
                  />
                </label>

                <button className="club-button-primary w-full">
                  <ShieldCheck size={17} />
                  Konto erstellen
                </button>
              </form>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-950/20 p-4 text-xs leading-5 text-emerald-100/70">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-300" />
                Dein Konto wird automatisch mit deinem Spielerprofil verbunden.
                Der Einladungslink kann danach nicht erneut verwendet werden.
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ErrorMessage({ code }: { code: string }) {
  const messages: Record<string, string> = {
    email: "Bitte eine gültige E-Mail-Adresse eingeben.",
    password: "Das Passwort muss mindestens acht Zeichen lang sein.",
    repeat: "Die beiden Passwörter stimmen nicht überein.",
    invalid: "Die Einladung wurde nicht gefunden.",
    expired: "Die Einladung ist nicht mehr gültig.",
    email_mismatch: "Diese Einladung ist für eine andere E-Mail-Adresse bestimmt.",
    exists: "Für diese E-Mail-Adresse existiert bereits ein Benutzerkonto.",
    create: "Das Benutzerkonto konnte nicht erstellt werden.",
    database: "Die Registrierung konnte nicht vollständig gespeichert werden.",
  };

  return (
    <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-200">
      {messages[code] ?? "Die Registrierung konnte nicht abgeschlossen werden."}
    </div>
  );
}
