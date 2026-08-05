import { Shirt } from "lucide-react";
import { getActivePlayers } from "../../lib/team";

export default async function TeamPage() {
  const players = await getActivePlayers();
  const squads = [...new Set(players.map((player) => player.squad))];

  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="club-eyebrow">
          Zurück zur Startseite
        </a>

        <h1 className="club-heading mt-4">Unsere Mannschaft</h1>

        {squads.map((squad) => {
          const squadPlayers = players.filter(
            (player) => player.squad === squad,
          );

          return (
            <section key={squad} className="mt-10">
              <p className="club-eyebrow">{squad}</p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {squadPlayers.map((player) => (
                  <a
                    key={player.id}
                    href={`/team/${player.slug}`}
                    className="club-card overflow-hidden transition hover:-translate-y-1"
                  >
                    <div className="relative h-80 bg-gradient-to-br from-club-burgundy to-black">
                      {player.image_url ? (
                        <img
                          src={player.image_url}
                          alt={`${player.first_name} ${player.last_name}`}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Shirt
                            size={64}
                            className="text-club-light-red/45"
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                      {player.shirt_number !== null && (
                        <span className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-club-red text-xl font-black">
                          {player.shirt_number}
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="club-eyebrow">{player.position}</p>
                      <h2 className="mt-2 text-2xl font-black">
                        {player.first_name} {player.last_name}
                      </h2>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
