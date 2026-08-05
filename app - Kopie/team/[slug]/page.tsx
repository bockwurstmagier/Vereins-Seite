import { notFound } from "next/navigation";
import {
  CalendarDays,
  Footprints,
  Instagram,
  Ruler,
  Shirt,
} from "lucide-react";

import { createClient } from "../../../lib/supabase/server";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const birthFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default async function PlayerPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !player) notFound();

  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <article className="mx-auto max-w-4xl">
        <a href="/team" className="club-eyebrow">
          Zurück zur Mannschaft
        </a>

        <div className="club-card mt-8 overflow-hidden">
          <div className="grid md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[420px] bg-gradient-to-br from-club-burgundy to-black">
              {player.image_url ? (
                <img
                  src={player.image_url}
                  alt={`${player.first_name} ${player.last_name}`}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full min-h-[420px] items-center justify-center">
                  <Shirt
                    size={80}
                    className="text-club-light-red/45"
                    aria-hidden="true"
                  />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {player.shirt_number !== null && (
                <span className="absolute left-5 top-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-club-red text-2xl font-black">
                  {player.shirt_number}
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <p className="club-eyebrow">{player.squad}</p>
              <h1 className="mt-3 text-4xl font-black leading-tight">
                {player.first_name} {player.last_name}
              </h1>
              <p className="mt-3 text-lg font-bold text-club-light-red">
                {player.position}
              </p>

              {player.short_profile && (
                <p className="mt-6 leading-7 text-zinc-300">
                  {player.short_profile}
                </p>
              )}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Fact
                  icon={<Footprints size={18} aria-hidden="true" />}
                  label="Starker Fuß"
                  value={player.strong_foot}
                />
                <Fact
                  icon={<Ruler size={18} aria-hidden="true" />}
                  label="Größe"
                  value={
                    player.height_cm ? `${player.height_cm} cm` : null
                  }
                />
                <Fact
                  icon={<CalendarDays size={18} aria-hidden="true" />}
                  label="Geburtsdatum"
                  value={
                    player.birth_date
                      ? birthFormatter.format(new Date(player.birth_date))
                      : null
                  }
                />
                <Fact
                  icon={<Shirt size={18} aria-hidden="true" />}
                  label="Nationalität"
                  value={player.nationality}
                />
              </div>

              {(player.favorite_club || player.favorite_player) && (
                <div className="club-card-inner mt-6 p-4">
                  {player.favorite_club && (
                    <p className="text-sm text-zinc-300">
                      <span className="font-black text-white">
                        Lieblingsverein:
                      </span>{" "}
                      {player.favorite_club}
                    </p>
                  )}

                  {player.favorite_player && (
                    <p className="mt-2 text-sm text-zinc-300">
                      <span className="font-black text-white">
                        Lieblingsspieler:
                      </span>{" "}
                      {player.favorite_player}
                    </p>
                  )}
                </div>
              )}

              {player.instagram_url && (
                <a
                  href={player.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="club-button-primary mt-6 w-full"
                >
                  <Instagram size={18} aria-hidden="true" />
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="text-club-light-red">{icon}</div>
      <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-white">
        {value || "Keine Angabe"}
      </p>
    </div>
  );
}
