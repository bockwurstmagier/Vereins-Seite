import "server-only";
import { createAdminClient } from "./supabase/admin";
import { getMatchCenterOverview } from "./match-center";
import type { MatchCenterMatch } from "./match-center";

export type PredictionLeaderboardEntry = { name: string; points: number; exact: number; tips: number };
export type MatchdayHubData = {
  match: MatchCenterMatch;
  predictionCount: number;
  reactions: Record<string, number>;
  leaderboard: PredictionLeaderboardEntry[];
};

export async function getMatchdayHubData(): Promise<MatchdayHubData | null> {
  const matches = await getMatchCenterOverview();
  const now = Date.now();
  const recentFinished = matches.find((item) => item.status === "finished" && now - new Date(item.match_date).getTime() < 18 * 60 * 60 * 1000);
  const nextScheduled = [...matches].filter((item) => item.status === "scheduled" && new Date(item.match_date).getTime() > now).sort((a,b)=>new Date(a.match_date).getTime()-new Date(b.match_date).getTime())[0];
  const match = matches.find((item) => item.status === "live") ?? recentFinished ?? nextScheduled ?? matches.find((item)=>item.status === "finished") ?? null;
  if (!match) return null;
  const supabase = createAdminClient();
  if (match.status === "finished" && match.home_score != null && match.away_score != null) {
    await settlePredictions(match.id, match.home_score, match.away_score);
  }
  const [predictions, reactions, leaderboard] = await Promise.all([
    supabase.from("match_predictions").select("id", { count: "exact", head: true }).eq("match_id", match.id),
    supabase.from("match_reactions").select("reaction").eq("match_id", match.id),
    supabase.from("match_predictions").select("display_name,points,is_exact").gt("points", 0).order("points", { ascending: false }).limit(5000),
  ]);
  const reactionCounts: Record<string, number> = {};
  for (const row of reactions.data ?? []) reactionCounts[row.reaction] = (reactionCounts[row.reaction] ?? 0) + 1;
  const map = new Map<string, PredictionLeaderboardEntry>();
  for (const row of leaderboard.data ?? []) {
    const name = String(row.display_name || "HUJA-Fan").slice(0, 30);
    const current = map.get(name) ?? { name, points: 0, exact: 0, tips: 0 };
    current.points += Number(row.points ?? 0); current.tips += 1; if (row.is_exact) current.exact += 1; map.set(name, current);
  }
  return { match, predictionCount: predictions.count ?? 0, reactions: reactionCounts, leaderboard: [...map.values()].sort((a,b)=>b.points-a.points || b.exact-a.exact).slice(0,5) };
}

export async function settlePredictions(matchId: string, home: number, away: number) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("match_predictions").select("id,home_score,away_score").eq("match_id", matchId).is("settled_at", null);
  const tendency = (h:number,a:number) => h === a ? 0 : h > a ? 1 : -1;
  for (const tip of data ?? []) {
    const exact = tip.home_score === home && tip.away_score === away;
    const points = exact ? 5 : tendency(tip.home_score, tip.away_score) === tendency(home, away) ? 2 : 0;
    await supabase.from("match_predictions").update({ points, is_exact: exact, settled_at: new Date().toISOString() }).eq("id", tip.id);
  }
}
