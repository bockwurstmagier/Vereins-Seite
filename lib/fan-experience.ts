import "server-only";

import { createHash } from "node:crypto";
import { createAdminClient } from "./supabase/admin";

export type FanPollCandidate = {
  playerId: string;
  firstName: string;
  lastName: string;
  shirtNumber: number | null;
  imageUrl: string | null;
  votes: number;
};

export type FanPollView = {
  id: string;
  matchId: string;
  status: "open" | "closed";
  endsAt: string;
  winnerPlayerId: string | null;
  totalVotes: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  candidates: FanPollCandidate[];
};

function fanSalt() {
  return (
    process.env.FAN_VOTE_SALT ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "huja-fan-experience"
  );
}

export function hashAnonymousId(value: string, scope = "analytics") {
  return createHash("sha256")
    .update(`${scope}:${fanSalt()}:${value}`)
    .digest("hex");
}

async function buildPollView(poll: {
  id: string;
  match_id: string;
  status: "open" | "closed";
  ends_at: string;
  winner_player_id: string | null;
}): Promise<FanPollView | null> {
  const supabase = createAdminClient();
  const [matchResult, candidatesResult, votesResult] = await Promise.all([
    supabase
      .from("matches")
      .select("home_team,away_team,home_score,away_score")
      .eq("id", poll.match_id)
      .maybeSingle(),
    supabase
      .from("fan_poll_candidates")
      .select("player_id,sort_order")
      .eq("poll_id", poll.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("fan_poll_votes")
      .select("candidate_player_id")
      .eq("poll_id", poll.id),
  ]);

  if (matchResult.error || !matchResult.data || candidatesResult.error) return null;

  const candidateRows = candidatesResult.data ?? [];
  const playerIds = candidateRows.map((row) => row.player_id);
  const playersResult = playerIds.length
    ? await supabase
        .from("players")
        .select("id,first_name,last_name,shirt_number,image_url")
        .in("id", playerIds)
    : { data: [], error: null };

  if (playersResult.error) return null;

  const playerMap = new Map(
    (playersResult.data ?? []).map((player) => [player.id, player]),
  );
  const voteMap = new Map<string, number>();
  for (const vote of votesResult.data ?? []) {
    voteMap.set(
      vote.candidate_player_id,
      (voteMap.get(vote.candidate_player_id) ?? 0) + 1,
    );
  }

  const candidates = candidateRows
    .map((row) => {
      const player = playerMap.get(row.player_id);
      if (!player) return null;
      return {
        playerId: player.id as string,
        firstName: player.first_name as string,
        lastName: player.last_name as string,
        shirtNumber: (player.shirt_number as number | null) ?? null,
        imageUrl: (player.image_url as string | null) ?? null,
        votes: voteMap.get(player.id as string) ?? 0,
      } satisfies FanPollCandidate;
    })
    .filter((entry): entry is FanPollCandidate => Boolean(entry));

  return {
    id: poll.id,
    matchId: poll.match_id,
    status: poll.status,
    endsAt: poll.ends_at,
    winnerPlayerId: poll.winner_player_id,
    totalVotes: candidates.reduce((sum, item) => sum + item.votes, 0),
    homeTeam: matchResult.data.home_team,
    awayTeam: matchResult.data.away_team,
    homeScore: matchResult.data.home_score,
    awayScore: matchResult.data.away_score,
    candidates,
  };
}

export async function finalizeFanPoll(pollId: string) {
  const supabase = createAdminClient();
  const { data: poll, error } = await supabase
    .from("fan_polls")
    .select("id,match_id,status,ends_at,winner_player_id")
    .eq("id", pollId)
    .maybeSingle();

  if (error || !poll) return null;
  if (poll.status === "closed") return buildPollView(poll);

  const view = await buildPollView(poll);
  if (!view) return null;

  const ranked = [...view.candidates].sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;
    return a.lastName.localeCompare(b.lastName, "de");
  });
  const winnerPlayerId = ranked[0]?.playerId ?? null;
  const now = new Date().toISOString();

  await supabase
    .from("fan_polls")
    .update({ status: "closed", winner_player_id: winnerPlayerId, closed_at: now })
    .eq("id", pollId);

  if (winnerPlayerId) {
    await supabase
      .from("matches")
      .update({ player_of_match_id: winnerPlayerId, updated_at: now })
      .eq("id", poll.match_id);
  }

  return buildPollView({
    ...poll,
    status: "closed",
    winner_player_id: winnerPlayerId,
  });
}

export async function getFanPollForMatch(matchId: string) {
  const supabase = createAdminClient();
  const { data: poll, error } = await supabase
    .from("fan_polls")
    .select("id,match_id,status,ends_at,winner_player_id")
    .eq("match_id", matchId)
    .maybeSingle();

  if (error || !poll) return null;
  if (poll.status === "open" && new Date(poll.ends_at).getTime() <= Date.now()) {
    return finalizeFanPoll(poll.id);
  }
  return buildPollView(poll);
}

export async function getCurrentFanPoll() {
  const supabase = createAdminClient();
  const { data: poll, error } = await supabase
    .from("fan_polls")
    .select("id,match_id,status,ends_at,winner_player_id,created_at")
    .in("status", ["open", "closed"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !poll) return null;
  if (poll.status === "open" && new Date(poll.ends_at).getTime() <= Date.now()) {
    return finalizeFanPoll(poll.id);
  }
  if (poll.status === "closed" && Date.now() - new Date(poll.created_at).getTime() > 72 * 60 * 60 * 1000) {
    return null;
  }
  return buildPollView(poll);
}

export type FanAnalyticsSummary = {
  onlineNow: number;
  visitorsToday: number;
  pageViewsToday: number;
  liveCenterNow: number;
  votesToday: number;
  topSections: Array<{ label: string; views: number }>;
};

function sectionLabel(path: string) {
  if (path.startsWith("/match-center")) return "LiveCenter";
  if (path.startsWith("/news")) return "News";
  if (path.startsWith("/tabelle")) return "Tabelle";
  if (path.startsWith("/team")) return "Team";
  if (path.startsWith("/galerie")) return "Galerie";
  if (path.startsWith("/spielplan")) return "Spielplan";
  if (path === "/") return "Startseite";
  return "Weitere";
}

export async function getFanAnalyticsSummary(): Promise<FanAnalyticsSummary> {
  const supabase = createAdminClient();
  const now = Date.now();
  const onlineSince = new Date(now - 90_000).toISOString();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [onlineResult, sessionsToday, viewsToday, votesToday] = await Promise.all([
    supabase
      .from("app_analytics_sessions")
      .select("anon_hash,current_path")
      .gte("last_seen_at", onlineSince),
    supabase
      .from("app_analytics_sessions")
      .select("anon_hash")
      .gte("last_seen_at", todayIso),
    supabase
      .from("app_analytics_events")
      .select("path")
      .eq("event_type", "page_view")
      .gte("created_at", todayIso)
      .limit(10000),
    supabase
      .from("fan_poll_votes")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayIso),
  ]);

  const onlineRows = onlineResult.data ?? [];
  const sessionHashes = new Set((sessionsToday.data ?? []).map((row) => row.anon_hash));
  const sectionCounts = new Map<string, number>();
  for (const row of viewsToday.data ?? []) {
    const label = sectionLabel(row.path || "/");
    sectionCounts.set(label, (sectionCounts.get(label) ?? 0) + 1);
  }

  return {
    onlineNow: new Set(onlineRows.map((row) => row.anon_hash)).size,
    visitorsToday: sessionHashes.size,
    pageViewsToday: viewsToday.data?.length ?? 0,
    liveCenterNow: new Set(
      onlineRows
        .filter((row) => String(row.current_path ?? "").startsWith("/match-center"))
        .map((row) => row.anon_hash),
    ).size,
    votesToday: votesToday.count ?? 0,
    topSections: [...sectionCounts.entries()]
      .map(([label, views]) => ({ label, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5),
  };
}
