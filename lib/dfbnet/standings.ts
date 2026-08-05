import type { SupabaseClient } from "@supabase/supabase-js";

type MatchRow = {
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
};

type TableRow = {
  team_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
  form: string[];
};

function getRow(map: Map<string, TableRow>, team: string) {
  const existing = map.get(team);
  if (existing) return existing;

  const created: TableRow = {
    team_name: team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    points: 0,
    form: [],
  };
  map.set(team, created);
  return created;
}

export async function rebuildStandings(input: {
  supabase: SupabaseClient;
  season: string;
  competition: string;
  clubName: string;
}) {
  const { data, error } = await input.supabase
    .from("matches")
    .select("home_team, away_team, home_score, away_score")
    .eq("season", input.season)
    .eq("competition", input.competition)
    .eq("status", "finished");

  if (error) {
    throw new Error(`Tabelle konnte nicht berechnet werden: ${error.message}`);
  }

  const rows = new Map<string, TableRow>();

  for (const match of (data ?? []) as MatchRow[]) {
    if (match.home_score === null || match.away_score === null) continue;

    const home = getRow(rows, match.home_team);
    const away = getRow(rows, match.away_team);

    home.played += 1;
    away.played += 1;
    home.goals_for += match.home_score;
    home.goals_against += match.away_score;
    away.goals_for += match.away_score;
    away.goals_against += match.home_score;

    if (match.home_score > match.away_score) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
      home.form.push("W");
      away.form.push("L");
    } else if (match.home_score < match.away_score) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
      home.form.push("L");
      away.form.push("W");
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
      home.form.push("D");
      away.form.push("D");
    }
  }

  const sorted = [...rows.values()].sort((a, b) => {
    const pointDifference = b.points - a.points;
    if (pointDifference) return pointDifference;

    const aDifference = a.goals_for - a.goals_against;
    const bDifference = b.goals_for - b.goals_against;
    if (bDifference !== aDifference) return bDifference - aDifference;

    return b.goals_for - a.goals_for;
  });

  const { error: deleteError } = await input.supabase
    .from("standings")
    .delete()
    .eq("season", input.season)
    .eq("competition", input.competition);

  if (deleteError) {
    throw new Error(`Alte Tabelle konnte nicht ersetzt werden: ${deleteError.message}`);
  }

  if (!sorted.length) return 0;

  const { error: insertError } = await input.supabase.from("standings").insert(
    sorted.map((row, index) => ({
      season: input.season,
      competition: input.competition,
      position: index + 1,
      team_name: row.team_name,
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      goals_for: row.goals_for,
      goals_against: row.goals_against,
      points: row.points,
      form: row.form.slice(-5),
      is_club: row.team_name
        .toLowerCase()
        .includes(input.clubName.toLowerCase()),
    })),
  );

  if (insertError) {
    throw new Error(`Neue Tabelle konnte nicht gespeichert werden: ${insertError.message}`);
  }

  return sorted.length;
}
