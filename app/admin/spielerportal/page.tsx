import {
  Link2,
  MessageSquarePlus,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";

import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";
import { createPlayerMessage, linkPlayerAccount } from "./actions";

type PageProps = {
  searchParams: Promise<{ linked?: string; message?: string }>;
};

export default async function PlayerPortalAdminPage({
  searchParams,
}: PageProps) {
  await requireRole(["administrator", "vorstand", "trainer", "betreuer"]);
  const params = await searchParams;
  const supabase = await createClient();

  const [playersResult, usersResult, linksResult, responsesResult, injuriesResult] =
    await Promise.all([
      supabase
        .from("players")
        .select("id,first_name,last_name,position")
        .eq("is_active", true)
        .order("last_name"),
      supabase
        .from("user_profiles")
        .select("id,email,display_name,role,is_active")
        .order("email"),
      supabase.from("player_accounts").select("user_id,player_id"),
      supabase
        .from("player_responses")
        .select("id,player_id,event_type,event_id,response,note,updated_at")
        .order("updated_at", { ascending: false })
        .limit(30),
      supabase
        .from("player_injury_reports")
        .select("id,player_id,body_area,description,status,created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const players = playersResult.data ?? [];
  const users = usersResult.data ?? [];
  const links = linksResult.data ?? [];
  const playerMap = new Map(
    players.map((player) => [
      player.id,
      `${player.first_name} ${player.last_name}`,
    ]),
  );

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <div className="flex items-start gap-4">
        <div className="club-icon-box mt-1">
          <UserRoundCog size={21} />
        </div>
        <div>
          <p className="club-eyebrow">Mannschaftskommunikation</p>
          <h1 className="club-heading mt-2">Spielerportal</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Benutzerkonten verknüpfen, Nachrichten senden und Rückmeldungen
            sowie Verletzungsmeldungen überblicken.
          </p>
        </div>
      </div>

      {(params.linked || params.message) && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-200">
          Aktion wurde erfolgreich gespeichert.
        </div>
      )}

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <section className="club-card p-5 sm:p-6">
          <Header icon={<Link2 size={19} />} title="Konto mit Spieler verknüpfen" />
          <form action={linkPlayerAccount} className="mt-5 space-y-4">
            <select name="user_id" required className="admin-input">
              <option value="">Benutzer auswählen</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.display_name || user.email} ({user.role})
                </option>
              ))}
            </select>

            <select name="player_id" required className="admin-input">
              <option value="">Spieler auswählen</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.first_name} {player.last_name} · {player.position}
                </option>
              ))}
            </select>

            <button className="club-button-primary w-full">
              <ShieldCheck size={17} />
              Verknüpfen und Spielerrolle setzen
            </button>
          </form>

          <div className="mt-6 space-y-2">
            {links.map((link) => {
              const user = users.find((entry) => entry.id === link.user_id);
              return (
                <div
                  key={link.user_id}
                  className="rounded-2xl border border-white/10 bg-black/25 p-3 text-sm"
                >
                  <p className="font-black text-white">
                    {playerMap.get(link.player_id) ?? "Spieler"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {user?.email ?? link.user_id}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="club-card p-5 sm:p-6">
          <Header icon={<MessageSquarePlus size={19} />} title="Nachricht senden" />
          <form action={createPlayerMessage} className="mt-5 space-y-4">
            <input name="title" required placeholder="Titel" className="admin-input" />
            <textarea
              name="body"
              required
              placeholder="Nachricht an die Spieler"
              className="admin-input min-h-32 py-3"
            />
            <select name="audience" className="admin-input">
              <option value="all">Alle Spieler</option>
              <option value="individual">Einzelner Spieler</option>
            </select>
            <select name="player_id" className="admin-input">
              <option value="">Kein einzelner Spieler</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.first_name} {player.last_name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-3 text-sm text-zinc-400">
              <input type="checkbox" name="is_important" />
              Als wichtige Nachricht markieren
            </label>
            <button className="club-button-primary w-full">
              <MessageSquarePlus size={17} />
              Nachricht veröffentlichen
            </button>
          </form>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="club-card p-5 sm:p-6">
          <Header icon={<ShieldCheck size={19} />} title="Letzte Rückmeldungen" />
          <div className="mt-5 space-y-3">
            {(responsesResult.data ?? []).map((response) => (
              <div
                key={response.id}
                className="rounded-2xl border border-white/10 bg-black/25 p-3"
              >
                <p className="font-black text-white">
                  {playerMap.get(response.player_id) ?? "Spieler"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {response.event_type} · {response.response}
                  {response.note ? ` · ${response.note}` : ""}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="club-card p-5 sm:p-6">
          <Header icon={<UserRoundCog size={19} />} title="Verletzungsmeldungen" />
          <div className="mt-5 space-y-3">
            {(injuriesResult.data ?? []).map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-amber-500/15 bg-amber-950/15 p-3"
              >
                <p className="font-black text-white">
                  {playerMap.get(report.player_id) ?? "Spieler"}
                </p>
                <p className="mt-1 text-xs font-bold uppercase text-amber-300">
                  {report.status}
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {report.body_area ? `${report.body_area}: ` : ""}
                  {report.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
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
