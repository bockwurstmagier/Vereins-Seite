import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Link2,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import { requireRole } from "../../../../lib/auth/roles";
import {
  createRegistrationUrl,
  createWhatsAppText,
  normalizePhoneNumber,
} from "../../../../lib/player-invitations";
import { createClient } from "../../../../lib/supabase/server";
import { getAdminSupabaseConfigStatus } from "../../../../lib/supabase/admin";
import {
  createInvitationsForOpenPlayers,
  createPlayerInvitation,
  renewPlayerInvitation,
  revokePlayerInvitation,
} from "./actions";
import InvitationShareButtons from "./InvitationShareButtons";

type PageProps = {
  searchParams: Promise<{
    created?: string;
    revoked?: string;
    bulk?: string;
  }>;
};

export default async function PlayerInvitationsPage({
  searchParams,
}: PageProps) {
  await requireRole(["administrator", "vorstand", "trainer", "betreuer"]);
  const params = await searchParams;
  const requestHeaders = await headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto") || "https";
  const forwardedHost = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const requestOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : undefined;
  const adminConfig = getAdminSupabaseConfigStatus();
  const supabase = await createClient();

  const [playersResult, accountsResult, invitationsResult] = await Promise.all([
    supabase
      .from("players")
      .select("id,first_name,last_name,position,squad")
      .eq("is_active", true)
      .order("last_name"),
    supabase.from("player_accounts").select("player_id,user_id"),
    supabase
      .from("player_invitations")
      .select(
        "id,player_id,invited_email,phone_number,token,expires_at,accepted_at,revoked_at,created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const players = playersResult.data ?? [];
  const accounts = accountsResult.data ?? [];
  const invitations = invitationsResult.data ?? [];
  const invitationDataError =
    playersResult.error?.message ||
    accountsResult.error?.message ||
    invitationsResult.error?.message ||
    null;
  const linkedPlayerIds = new Set(accounts.map((account) => account.player_id));
  const playerMap = new Map(
    players.map((player) => [
      player.id,
      {
        ...player,
        name: `${player.first_name} ${player.last_name}`,
      },
    ]),
  );

  const openPlayers = players.filter((player) => !linkedPlayerIds.has(player.id));
  const createdInvitation = params.created
    ? invitations.find((entry) => entry.id === params.created)
    : null;

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <Link href="/admin/spielerportal" className="club-button-secondary inline-flex">
        <ArrowLeft size={16} />
        Spielerportal
      </Link>

      <div className="mt-6 flex items-start gap-4">
        <div className="club-icon-box mt-1">
          <UserPlus size={21} />
        </div>
        <div>
          <p className="club-eyebrow">Kontrollierte Registrierung</p>
          <h1 className="club-heading mt-2">Spieler-Einladungen</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Sichere Registrierungslinks erstellen und direkt per WhatsApp,
            E-Mail oder kopiertem Link versenden.
          </p>
        </div>
      </div>

      {invitationDataError && (
        <section className="mt-7 rounded-3xl border border-red-500/25 bg-red-950/25 p-5 sm:p-6">
          <p className="font-black text-red-100">Spieler-Einladungen konnten nicht vollständig geladen werden</p>
          <p className="mt-2 text-sm leading-6 text-red-100/70">{invitationDataError}</p>
          <p className="mt-2 text-xs text-red-200/60">Prüfe, ob die Spielerportal-SQL-Migrationen in Supabase vollständig ausgeführt wurden.</p>
        </section>
      )}

      {!adminConfig.ok && (
        <section className="mt-7 rounded-3xl border border-red-500/25 bg-red-950/25 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck size={22} className="mt-0.5 shrink-0 text-red-300" />
            <div>
              <p className="font-black text-red-100">Einladungs-Registrierung noch nicht vollständig konfiguriert</p>
              <p className="mt-2 text-sm leading-6 text-red-100/70">
                Auf dem Server fehlt: <span className="font-black text-red-200">{adminConfig.missing.join(", ")}</span>.
                Links können zwar erstellt werden, die öffentliche Registrierungsseite funktioniert aber erst nach dem Setzen der Variable und einem neuen Deployment.
              </p>
            </div>
          </div>
        </section>
      )}

      {params.revoked && <Notice text="Einladung wurde widerrufen." />}
      {params.bulk && (
        <Notice text={`${params.bulk} Einladungen wurden für offene Spieler erstellt.`} />
      )}

      {createdInvitation && (() => {
        const player = playerMap.get(createdInvitation.player_id);
        const registrationUrl = createRegistrationUrl(createdInvitation.token, requestOrigin);
        const whatsappText = createWhatsAppText({
          playerName: player?.name ?? "Spieler",
          registrationUrl,
          expiresAt: createdInvitation.expires_at,
        });

        return (
          <section className="mt-7 rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={22} className="mt-1 text-emerald-300" />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-black text-white">
                  Einladung für {player?.name ?? "Spieler"} ist bereit
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Der Link ist einmal nutzbar und läuft nach sieben Tagen ab.
                </p>
                <div className="mt-4 rounded-2xl bg-black/30 p-3 text-xs break-all text-zinc-300">
                  {registrationUrl}
                </div>
                <div className="mt-4">
                  <InvitationShareButtons
                    registrationUrl={registrationUrl}
                    whatsappText={whatsappText}
                    phoneNumber={normalizePhoneNumber(
                      createdInvitation.phone_number ?? "",
                    )}
                  />
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      <div className="mt-7 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="club-card p-5 sm:p-6">
          <Header icon={<Link2 size={19} />} title="Neue Einladung" />
          <form action={createPlayerInvitation} className="mt-5 space-y-4">
            <select name="player_id" required className="admin-input">
              <option value="">Spieler auswählen</option>
              {openPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.first_name} {player.last_name} · {player.position}
                </option>
              ))}
            </select>

            <input
              name="phone_number"
              type="tel"
              placeholder="Telefonnummer, z. B. 0176 12345678"
              className="admin-input"
            />

            <input
              name="invited_email"
              type="email"
              placeholder="E-Mail optional"
              className="admin-input"
            />

            <button className="club-button-primary w-full">
              <MessageCircle size={17} />
              Einladung für WhatsApp erstellen
            </button>
          </form>

          <form action={createInvitationsForOpenPlayers} className="mt-4">
            <button className="club-button-secondary w-full">
              <Users size={17} />
              Links für alle offenen Spieler erstellen
            </button>
          </form>

          <p className="mt-4 text-xs leading-5 text-zinc-600">
            Ohne Telefonnummer öffnet der WhatsApp-Button die allgemeine
            Teilen-Ansicht. Die E-Mail kann der Spieler bei der Registrierung
            selbst eintragen, wenn sie hier nicht vorgegeben wird.
          </p>
        </section>

        <section className="club-card overflow-hidden">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <Header icon={<ShieldCheck size={19} />} title="Einladungsstatus" />
          </div>

          <div className="divide-y divide-white/[0.07]">
            {players.map((player) => {
              const linked = linkedPlayerIds.has(player.id);
              const invitation = invitations.find(
                (entry) =>
                  entry.player_id === player.id &&
                  !entry.revoked_at &&
                  !entry.accepted_at,
              );
              const expired =
                invitation &&
                new Date(invitation.expires_at).getTime() < Date.now();

              return (
                <article key={player.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-white">
                        {player.first_name} {player.last_name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {player.position} · {player.squad}
                      </p>
                    </div>

                    <Status
                      linked={linked}
                      hasInvitation={Boolean(invitation)}
                      expired={Boolean(expired)}
                    />
                  </div>

                  {invitation && !linked && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <form action={renewPlayerInvitation}>
                        <input
                          type="hidden"
                          name="invitation_id"
                          value={invitation.id}
                        />
                        <button className="club-button-secondary w-full">
                          <RefreshCw size={15} />
                          Link neu erstellen
                        </button>
                      </form>

                      <form action={revokePlayerInvitation}>
                        <input
                          type="hidden"
                          name="invitation_id"
                          value={invitation.id}
                        />
                        <button className="club-button-secondary w-full text-red-300">
                          <Trash2 size={15} />
                          Widerrufen
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Status({
  linked,
  hasInvitation,
  expired,
}: {
  linked: boolean;
  hasInvitation: boolean;
  expired: boolean;
}) {
  if (linked) {
    return (
      <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-300">
        Registriert
      </span>
    );
  }

  if (hasInvitation && expired) {
    return (
      <span className="rounded-full bg-red-500/15 px-3 py-1.5 text-[10px] font-black uppercase text-red-300">
        Abgelaufen
      </span>
    );
  }

  if (hasInvitation) {
    return (
      <span className="rounded-full bg-amber-500/15 px-3 py-1.5 text-[10px] font-black uppercase text-amber-300">
        Einladung aktiv
      </span>
    );
  }

  return (
    <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase text-zinc-500">
      Nicht eingeladen
    </span>
  );
}

function Header({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="club-icon-box">{icon}</div>
      <h2 className="text-xl font-black uppercase text-white">{title}</h2>
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-200">
      <CheckCircle2 size={17} />
      {text}
    </div>
  );
}
