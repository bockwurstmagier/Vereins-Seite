import { getAvailableSeasons, getPlayerSeasonStats } from "./player-statistics";
import { createClient } from "./supabase/server";

export async function getTrainerCockpitData(season?: string) {
  const supabase = await createClient();
  const seasons = await getAvailableSeasons();
  const selectedSeason = season && seasons.includes(season) ? season : seasons[0];

  const [stats, upcomingResult, finishedResult, playersResult] = await Promise.all([
    getPlayerSeasonStats(selectedSeason),
    supabase
      .from("matches")
      .select("id, home_team, away_team, match_date, competition, location, status")
      .eq("status", "scheduled")
      .gte("match_date", new Date().toISOString())
      .order("match_date", { ascending: true })
      .limit(5),
    supabase
      .from("matches")
      .select("id, home_team, away_team, home_score, away_score, match_date")
      .eq("status", "finished")
      .eq("season", selectedSeason)
      .order("match_date", { ascending: false })
      .limit(5),
    supabase.from("players").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const finished = finishedResult.data ?? [];
  const wins = finished.filter((match) => {
    const homeIsClub = match.home_team.toLowerCase().includes("middelich-resse");
    const ourScore = homeIsClub ? match.home_score ?? 0 : match.away_score ?? 0;
    const opponentScore = homeIsClub ? match.away_score ?? 0 : match.home_score ?? 0;
    return ourScore > opponentScore;
  }).length;
  const draws = finished.filter((match) => (match.home_score ?? 0) === (match.away_score ?? 0)).length;
  const losses = Math.max(0, finished.length - wins - draws);

  return {
    seasons,
    selectedSeason,
    stats,
    topScorers: stats.slice().sort((a, b) => b.goals - a.goals || b.assists - a.assists).slice(0, 5),
    mostAppearances: stats.slice().sort((a, b) => b.appearances - a.appearances || b.minutes - a.minutes).slice(0, 5),
    cardLeaders: stats.slice().sort((a, b) => (b.yellowCards + b.redCards * 3) - (a.yellowCards + a.redCards * 3)).slice(0, 5),
    upcoming: upcomingResult.data ?? [],
    recent: finished,
    activePlayers: playersResult.count ?? 0,
    record: { games: finished.length, wins, draws, losses },
  };
}
