import { createClient } from "./supabase/server";

export type PlayerSeasonStat = {
  playerId: string;
  firstName: string;
  lastName: string;
  slug: string;
  squad: string;
  position: string;
  shirtNumber: number | null;
  imageUrl: string | null;
  appearances: number;
  starts: number;
  substituteAppearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
  playerOfMatch: number;
};

type MatchRow = {
  id: string;
  season: string;
  match_duration: number | null;
  current_minute: number | null;
  player_of_match_id: string | null;
};

type SquadRow = {
  match_id: string;
  player_id: string;
  role: "starter" | "bench";
};

type EventRow = {
  match_id: string;
  event_type: "goal" | "yellow_card" | "red_card" | "substitution" | "note";
  minute: number;
  player_id: string | null;
  secondary_player_id: string | null;
};

type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
  squad: string;
  position: string;
  shirt_number: number | null;
  image_url: string | null;
};

export async function getAvailableSeasons(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select("season")
    .order("season", { ascending: false });

  if (error) {
    console.error("Saisons konnten nicht geladen werden:", error.message);
    return ["2026/27"];
  }

  const seasons = [
    ...new Set(
      ((data ?? []) as Array<{ season: string | null }>)
        .map((row) => row.season)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  return seasons.length ? seasons : ["2026/27"];
}

export async function getPlayerSeasonStats(
  season: string,
): Promise<PlayerSeasonStat[]> {
  const supabase = await createClient();

  const [playersResult, matchesResult] = await Promise.all([
    supabase
      .from("players")
      .select(
        "id, first_name, last_name, slug, squad, position, shirt_number, image_url",
      )
      .eq("is_active", true),
    supabase
      .from("matches")
      .select(
        "id, season, match_duration, current_minute, player_of_match_id",
      )
      .eq("status", "finished")
      .eq("season", season),
  ]);

  if (playersResult.error) {
    console.error("Spieler konnten nicht geladen werden:", playersResult.error.message);
    return [];
  }

  if (matchesResult.error) {
    console.error("Spiele konnten nicht geladen werden:", matchesResult.error.message);
    return [];
  }

  const players = (playersResult.data ?? []) as PlayerRow[];
  const matches = (matchesResult.data ?? []) as MatchRow[];
  const matchIds = matches.map((match) => match.id);

  let squad: SquadRow[] = [];
  let events: EventRow[] = [];

  if (matchIds.length) {
    const [squadResult, eventsResult] = await Promise.all([
      supabase
        .from("match_squad")
        .select("match_id, player_id, role")
        .in("match_id", matchIds),
      supabase
        .from("match_events")
        .select(
          "match_id, event_type, minute, player_id, secondary_player_id",
        )
        .in("match_id", matchIds),
    ]);

    if (squadResult.error) {
      console.error("Aufstellungen konnten nicht geladen werden:", squadResult.error.message);
    } else {
      squad = (squadResult.data ?? []) as SquadRow[];
    }

    if (eventsResult.error) {
      console.error("Ereignisse konnten nicht geladen werden:", eventsResult.error.message);
    } else {
      events = (eventsResult.data ?? []) as EventRow[];
    }
  }

  const byPlayer = new Map<string, PlayerSeasonStat>();

  for (const player of players) {
    byPlayer.set(player.id, {
      playerId: player.id,
      firstName: player.first_name,
      lastName: player.last_name,
      slug: player.slug,
      squad: player.squad,
      position: player.position,
      shirtNumber: player.shirt_number,
      imageUrl: player.image_url,
      appearances: 0,
      starts: 0,
      substituteAppearances: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      minutes: 0,
      playerOfMatch: 0,
    });
  }

  for (const match of matches) {
    const duration = Math.max(
      1,
      match.match_duration ?? match.current_minute ?? 90,
    );
    const matchSquad = squad.filter((entry) => entry.match_id === match.id);
    const matchEvents = events.filter((event) => event.match_id === match.id);

    const substitutions = matchEvents.filter(
      (event) => event.event_type === "substitution",
    );
    const redCards = matchEvents.filter(
      (event) => event.event_type === "red_card",
    );

    for (const entry of matchSquad) {
      const stat = byPlayer.get(entry.player_id);
      if (!stat) continue;

      if (entry.role === "starter") {
        stat.appearances += 1;
        stat.starts += 1;

        const substitutedOut = substitutions.find(
          (event) => event.secondary_player_id === entry.player_id,
        );
        const redCard = redCards.find(
          (event) => event.player_id === entry.player_id,
        );
        const endMinute = Math.min(
          duration,
          substitutedOut?.minute ?? duration,
          redCard?.minute ?? duration,
        );
        stat.minutes += Math.max(0, endMinute);
      } else {
        const substitutedIn = substitutions.find(
          (event) => event.player_id === entry.player_id,
        );
        if (substitutedIn) {
          stat.appearances += 1;
          stat.substituteAppearances += 1;
          const redCard = redCards.find(
            (event) => event.player_id === entry.player_id,
          );
          const endMinute = Math.min(duration, redCard?.minute ?? duration);
          stat.minutes += Math.max(0, endMinute - substitutedIn.minute);
        }
      }
    }

    if (match.player_of_match_id) {
      const stat = byPlayer.get(match.player_of_match_id);
      if (stat) stat.playerOfMatch += 1;
    }

    for (const event of matchEvents) {
      if (event.event_type === "goal") {
        if (event.player_id) {
          const scorer = byPlayer.get(event.player_id);
          if (scorer) scorer.goals += 1;
        }
        if (event.secondary_player_id) {
          const assister = byPlayer.get(event.secondary_player_id);
          if (assister) assister.assists += 1;
        }
      }

      if (event.event_type === "yellow_card" && event.player_id) {
        const stat = byPlayer.get(event.player_id);
        if (stat) stat.yellowCards += 1;
      }

      if (event.event_type === "red_card" && event.player_id) {
        const stat = byPlayer.get(event.player_id);
        if (stat) stat.redCards += 1;
      }
    }
  }

  return [...byPlayer.values()].sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.assists !== a.assists) return b.assists - a.assists;
    if (b.appearances !== a.appearances) return b.appearances - a.appearances;
    return a.lastName.localeCompare(b.lastName, "de");
  });
}

export async function getPlayerStatisticsBySlug(
  slug: string,
  season?: string,
): Promise<{ season: string; stat: PlayerSeasonStat | null }> {
  const seasons = await getAvailableSeasons();
  const selectedSeason = season && seasons.includes(season) ? season : seasons[0];
  const stats = await getPlayerSeasonStats(selectedSeason);

  return {
    season: selectedSeason,
    stat: stats.find((entry) => entry.slug === slug) ?? null,
  };
}
