import {
  Goal,
  Shield,
  Shirt,
  Users,
  UserRoundCog,
  Clipboard,
  HandHeart,
} from "lucide-react";

import type { PublicPlayer } from "../../lib/team";
import { getActivePlayers } from "../../lib/team";

const PLAYER_GROUPS = [
  { key: "Torwart", title: "Torhüter", icon: Goal },
  { key: "Abwehr", title: "Abwehr", icon: Shield },
  { key: "Mittelfeld", title: "Mittelfeld", icon: Shirt },
  { key: "Sturm", title: "Sturm", icon: Goal },
] as const;

const STAFF_GROUPS = [
  { key: "Trainer", title: "Trainer", icon: UserRoundCog },
  { key: "Co-Trainer", title: "Co-Trainer", icon: Clipboard },
  { key: "Betreuer", title: "Betreuer", icon: HandHeart },
  { key: "Vereinsleitung", title: "Vereinsleitung", icon: Users },
] as const;

export default async function TeamPage() {
  const players = await getActivePlayers();

  const playerSquads = unique(
    players
      .filter((player) => !isStaff(player))
      .map((player) => player.squad),
  );

  const staff = players.filter(isStaff);
  const staffSquads = unique(staff.map((player) => player.squad));

  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="club-eyebrow">
          Zurück zur Startseite
        </a>

        <div className="mt-5 flex items-start gap-4">
          <div className="club-icon-box mt-1">
            <Users size={20} />
          </div>
          <div>
            <p className="club-eyebrow">Unser Verein</p>
            <h1 className="club-heading mt-2">Mannschaft & Team</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
              Spieler, Trainerteam und Betreuer übersichtlich nach ihren
              Aufgaben geordnet.
            </p>
          </div>
        </div>

        {!players.length && (
          <div className="club-card mt-8 p-8 text-center text-zinc-500">
            Aktuell sind noch keine Teamprofile veröffentlicht.
          </div>
        )}

        {playerSquads.map((squad) => {
          const squadPlayers = players.filter(
            (player) => player.squad === squad && !isStaff(player),
          );

          return (
            <section key={squad} className="mt-12">
              <SquadHeader title={squad} subtitle="Unsere Mannschaft" />

              <div className="mt-7 space-y-10">
                {PLAYER_GROUPS.map((group) => {
                  const groupPlayers = squadPlayers.filter(
                    (player) => normalizePosition(player.position) === group.key,
                  );

                  if (!groupPlayers.length) return null;

                  return (
                    <TeamGroup
                      key={group.key}
                      title={group.title}
                      icon={group.icon}
                      players={groupPlayers}
                    />
                  );
                })}

                {squadPlayers.some(
                  (player) =>
                    !PLAYER_GROUPS.some(
                      (group) =>
                        group.key === normalizePosition(player.position),
                    ),
                ) && (
                  <TeamGroup
                    title="Weitere Spieler"
                    icon={Shirt}
                    players={squadPlayers.filter(
                      (player) =>
                        !PLAYER_GROUPS.some(
                          (group) =>
                            group.key === normalizePosition(player.position),
                        ),
                    )}
                  />
                )}
              </div>
            </section>
          );
        })}

        {staff.length > 0 && (
          <section className="mt-16 border-t border-white/10 pt-12">
            <SquadHeader title="Trainer & Staff" subtitle="Unser Team hinter dem Team" />

            <div className="mt-7 space-y-10">
              {STAFF_GROUPS.map((group) => {
                const groupPlayers = staff.filter(
                  (player) => normalizePosition(player.position) === group.key,
                );

                if (!groupPlayers.length) return null;

                return (
                  <TeamGroup
                    key={group.key}
                    title={group.title}
                    icon={group.icon}
                    players={groupPlayers}
                  />
                );
              })}

              {staffSquads
                .filter((squad) => squad !== "Trainer & Staff")
                .map(() => null)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function SquadHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[2rem] border border-club-light-red/15 bg-gradient-to-r from-club-burgundy/45 via-black/45 to-black p-5 sm:p-6">
      <p className="club-eyebrow">{subtitle}</p>
      <h2 className="mt-2 text-2xl font-black uppercase text-white sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function TeamGroup({
  title,
  icon: Icon,
  players,
}: {
  title: string;
  icon: typeof Shirt;
  players: PublicPlayer[];
}) {
  const orderedPlayers = [...players].sort((a, b) => {
    const order = a.sort_order - b.sort_order;
    if (order !== 0) return order;
    return a.last_name.localeCompare(b.last_name, "de");
  });

  return (
    <section>
      <div className="flex items-center gap-3">
        <div className="club-icon-box">
          <Icon size={18} />
        </div>
        <div>
          <p className="club-eyebrow">Bereich</p>
          <h3 className="mt-1 text-xl font-black uppercase text-white">
            {title}
          </h3>
        </div>
        <span className="ml-auto rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black text-zinc-500">
          {orderedPlayers.length}
        </span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {orderedPlayers.map((player) => (
          <a
            key={player.id}
            href={`/team/${player.slug}`}
            className="club-card group overflow-hidden transition hover:-translate-y-1 hover:border-club-light-red/20"
          >
            <div className="relative h-72 bg-gradient-to-br from-club-burgundy to-black">
              {player.image_url ? (
                <img
                  src={player.image_url}
                  alt={`${player.first_name} ${player.last_name}`}
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Shirt
                    size={58}
                    className="text-club-light-red/45"
                    aria-hidden="true"
                  />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              {player.shirt_number !== null && (
                <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-club-red text-lg font-black">
                  {player.shirt_number}
                </span>
              )}
            </div>

            <div className="p-5">
              <p className="club-eyebrow">{player.position}</p>
              <h4 className="mt-2 text-xl font-black">
                {player.first_name} {player.last_name}
              </h4>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function normalizePosition(position: string) {
  const normalized = position.trim().toLowerCase();

  if (["torwart", "torhüter", "torhueter"].includes(normalized)) return "Torwart";
  if (normalized.includes("abwehr")) return "Abwehr";
  if (normalized.includes("mittel")) return "Mittelfeld";
  if (normalized.includes("sturm") || normalized.includes("angriff")) return "Sturm";
  if (normalized === "trainer" || normalized === "cheftrainer") return "Trainer";
  if (normalized.includes("co-trainer") || normalized.includes("cotrainer")) {
    return "Co-Trainer";
  }
  if (normalized.includes("betreuer")) return "Betreuer";
  if (
    normalized.includes("leitung") ||
    normalized.includes("vorstand") ||
    normalized.includes("präsident") ||
    normalized.includes("praesident")
  ) {
    return "Vereinsleitung";
  }

  return position;
}

function isStaff(player: PublicPlayer) {
  return ["Trainer", "Co-Trainer", "Betreuer", "Vereinsleitung"].includes(
    normalizePosition(player.position),
  );
}

function unique(values: string[]) {
  return [...new Set(values)];
}
