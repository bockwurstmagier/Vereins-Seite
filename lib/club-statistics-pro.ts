import "server-only";

import { getAvailableSeasons, getPlayerSeasonStats } from "./player-statistics";
import { createClient } from "./supabase/server";

const CLUB_NAME = "middelich-resse";

type MatchRow = {
  id: string;
  season: string | null;
  competition: string;
  home_team: string;
  away_team: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
};

type EventRow = {
  id: string;
  match_id: string;
  event_type: string;
  minute: number;
  player_id: string | null;
  secondary_player_id: string | null;
};

type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
  image_url: string | null;
};

type ClubRow = {
  name: string;
  logo_url: string | null;
};

export type OpponentRecord = {
  opponent: string;
  logoUrl: string | null;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  lastMatchDate: string;
};

export type ResultRecord = {
  matchId: string;
  label: string;
  score: string;
  date: string;
  value: number;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isClub(name: string) {
  return normalize(name).includes(CLUB_NAME);
}

function opponent(match: MatchRow) {
  return isClub(match.home_team) ? match.away_team : match.home_team;
}

function scores(match: MatchRow) {
  const home = match.home_score ?? 0;
  const away = match.away_score ?? 0;
  return isClub(match.home_team)
    ? { ours: home, theirs: away }
    : { ours: away, theirs: home };
}

function result(match: MatchRow) {
  const { ours, theirs } = scores(match);
  if (ours > theirs) return "W";
  if (ours < theirs) return "L";
  return "D";
}

function formatMatch(match: MatchRow) {
  return `${match.home_team} ${match.home_score ?? 0}:${match.away_score ?? 0} ${match.away_team}`;
}

function streak(matches: MatchRow[], accepted: "W" | "UNBEATEN") {
  let current = 0;
  let best = 0;

  for (const match of matches) {
    const matchResult = result(match);
    const okay =
      accepted === "W" ? matchResult === "W" : matchResult !== "L";

    if (okay) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }

  return best;
}

export async function getClubStatisticsPro(requestedSeason?: string) {
  const supabase = await createClient();
  const seasons = await getAvailableSeasons();
  const season =
    requestedSeason && seasons.includes(requestedSeason)
      ? requestedSeason
      : seasons[0] ?? "2026/27";

  const [matchesResult, eventsResult, playersResult, clubsResult, playerStats] =
    await Promise.all([
      supabase
        .from("matches")
        .select(
          "id,season,competition,home_team,away_team,match_date,home_score,away_score,status",
        )
        .eq("status", "finished")
        .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
        .order("match_date", { ascending: true }),
      supabase
        .from("match_events")
        .select(
          "id,match_id,event_type,minute,player_id,secondary_player_id",
        )
        .order("minute", { ascending: true }),
      supabase
        .from("players")
        .select("id,first_name,last_name,slug,image_url"),
      supabase.from("clubs").select("name,logo_url"),
      getPlayerSeasonStats(season),
    ]);

  const allMatches = (matchesResult.data ?? []) as MatchRow[];
  const seasonMatches = allMatches.filter((match) => match.season === season);
  const events = (eventsResult.data ?? []) as EventRow[];
  const players = (playersResult.data ?? []) as PlayerRow[];
  const clubs = (clubsResult.data ?? []) as ClubRow[];
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const clubLogoMap = new Map(
    clubs.map((club) => [normalize(club.name), club.logo_url]),
  );

  const played = seasonMatches.length;
  const wins = seasonMatches.filter((match) => result(match) === "W").length;
  const draws = seasonMatches.filter((match) => result(match) === "D").length;
  const losses = seasonMatches.filter((match) => result(match) === "L").length;
  const goalsFor = seasonMatches.reduce(
    (sum, match) => sum + scores(match).ours,
    0,
  );
  const goalsAgainst = seasonMatches.reduce(
    (sum, match) => sum + scores(match).theirs,
    0,
  );

  const homeMatches = seasonMatches.filter((match) => isClub(match.home_team));
  const awayMatches = seasonMatches.filter((match) => !isClub(match.home_team));

  const opponentMap = new Map<string, OpponentRecord>();
  for (const match of allMatches) {
    const opponentName = opponent(match);
    const normalizedOpponent = normalize(opponentName);
    const row = opponentMap.get(normalizedOpponent) ?? {
      opponent: opponentName,
      logoUrl: clubLogoMap.get(normalizedOpponent) ?? null,
      games: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      lastMatchDate: match.match_date,
    };

    const score = scores(match);
    const matchResult = result(match);
    row.games += 1;
    row.goalsFor += score.ours;
    row.goalsAgainst += score.theirs;
    row.lastMatchDate = match.match_date;

    if (matchResult === "W") {
      row.wins += 1;
      row.points += 3;
    } else if (matchResult === "D") {
      row.draws += 1;
      row.points += 1;
    } else {
      row.losses += 1;
    }

    opponentMap.set(normalizedOpponent, row);
  }

  const opponentRecords = [...opponentMap.values()].sort(
    (a, b) => b.games - a.games || b.wins - a.wins,
  );

  const biggestWinMatch = [...allMatches]
    .filter((match) => result(match) === "W")
    .sort(
      (a, b) =>
        scores(b).ours -
        scores(b).theirs -
        (scores(a).ours - scores(a).theirs),
    )[0];

  const biggestLossMatch = [...allMatches]
    .filter((match) => result(match) === "L")
    .sort(
      (a, b) =>
        scores(b).theirs -
        scores(b).ours -
        (scores(a).theirs - scores(a).ours),
    )[0];

  const highestScoringMatch = [...allMatches].sort(
    (a, b) =>
      (b.home_score ?? 0) +
      (b.away_score ?? 0) -
      ((a.home_score ?? 0) + (a.away_score ?? 0)),
  )[0];

  const clubMatchIds = new Set(allMatches.map((match) => match.id));
  const clubEvents = events.filter((event) => clubMatchIds.has(event.match_id));
  const goalEvents = clubEvents.filter(
    (event) => event.event_type === "goal" && event.player_id,
  );
  const fastestGoal = [...goalEvents].sort((a, b) => a.minute - b.minute)[0];

  const allTimePlayers = new Map<
    string,
    {
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
      goals: number;
      assists: number;
      yellowCards: number;
      redCards: number;
    }
  >();

  for (const player of players) {
    allTimePlayers.set(player.id, {
      id: player.id,
      name: `${player.first_name} ${player.last_name}`,
      slug: player.slug,
      imageUrl: player.image_url,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
    });
  }

  for (const event of clubEvents) {
    if (event.player_id) {
      const player = allTimePlayers.get(event.player_id);
      if (player) {
        if (event.event_type === "goal") player.goals += 1;
        if (event.event_type === "yellow_card") player.yellowCards += 1;
        if (event.event_type === "red_card") player.redCards += 1;
      }
    }

    if (event.event_type === "goal" && event.secondary_player_id) {
      const assister = allTimePlayers.get(event.secondary_player_id);
      if (assister) assister.assists += 1;
    }
  }

  const allTimeList = [...allTimePlayers.values()];
  const chronological = [...allMatches].sort(
    (a, b) =>
      new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
  );

  const form = [...seasonMatches]
    .sort(
      (a, b) =>
        new Date(b.match_date).getTime() - new Date(a.match_date).getTime(),
    )
    .slice(0, 10)
    .reverse()
    .map((match) => ({
      result: result(match),
      opponent: opponent(match),
      score: `${scores(match).ours}:${scores(match).theirs}`,
      date: match.match_date,
    }));

  return {
    seasons,
    season,
    overview: {
      played,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points: wins * 3 + draws,
      winRate: played ? Math.round((wins / played) * 100) : 0,
      pointsPerGame: played ? ((wins * 3 + draws) / played).toFixed(2) : "0.00",
      home: {
        played: homeMatches.length,
        wins: homeMatches.filter((match) => result(match) === "W").length,
        goalsFor: homeMatches.reduce(
          (sum, match) => sum + scores(match).ours,
          0,
        ),
        goalsAgainst: homeMatches.reduce(
          (sum, match) => sum + scores(match).theirs,
          0,
        ),
      },
      away: {
        played: awayMatches.length,
        wins: awayMatches.filter((match) => result(match) === "W").length,
        goalsFor: awayMatches.reduce(
          (sum, match) => sum + scores(match).ours,
          0,
        ),
        goalsAgainst: awayMatches.reduce(
          (sum, match) => sum + scores(match).theirs,
          0,
        ),
      },
    },
    form,
    seasonPlayers: playerStats,
    allTime: {
      topScorers: [...allTimeList]
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
        .slice(0, 10),
      topAssists: [...allTimeList]
        .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
        .slice(0, 10),
      cards: [...allTimeList]
        .sort(
          (a, b) =>
            b.yellowCards +
            b.redCards * 3 -
            (a.yellowCards + a.redCards * 3),
        )
        .slice(0, 10),
    },
    opponentRecords,
    records: {
      biggestWin: biggestWinMatch
        ? {
            matchId: biggestWinMatch.id,
            label: formatMatch(biggestWinMatch),
            score: `${scores(biggestWinMatch).ours}:${scores(biggestWinMatch).theirs}`,
            date: biggestWinMatch.match_date,
            value: scores(biggestWinMatch).ours - scores(biggestWinMatch).theirs,
          }
        : null,
      biggestLoss: biggestLossMatch
        ? {
            matchId: biggestLossMatch.id,
            label: formatMatch(biggestLossMatch),
            score: `${scores(biggestLossMatch).ours}:${scores(biggestLossMatch).theirs}`,
            date: biggestLossMatch.match_date,
            value: scores(biggestLossMatch).theirs - scores(biggestLossMatch).ours,
          }
        : null,
      highestScoring: highestScoringMatch
        ? {
            matchId: highestScoringMatch.id,
            label: formatMatch(highestScoringMatch),
            score: `${highestScoringMatch.home_score ?? 0}:${highestScoringMatch.away_score ?? 0}`,
            date: highestScoringMatch.match_date,
            value:
              (highestScoringMatch.home_score ?? 0) +
              (highestScoringMatch.away_score ?? 0),
          }
        : null,
      fastestGoal: fastestGoal
        ? {
            minute: fastestGoal.minute,
            player: fastestGoal.player_id
              ? playerMap.get(fastestGoal.player_id)
              : null,
          }
        : null,
      longestWinningStreak: streak(chronological, "W"),
      longestUnbeatenStreak: streak(chronological, "UNBEATEN"),
      totalMatches: allMatches.length,
      totalGoals: allMatches.reduce(
        (sum, match) => sum + scores(match).ours,
        0,
      ),
    },
  };
}
