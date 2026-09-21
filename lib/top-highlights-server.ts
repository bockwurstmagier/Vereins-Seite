import "server-only";
import { createClient } from "./supabase/server";
import { isMiddelichResse } from "./club-name";
import { isClubMatch } from "./match-selection";
import { isTopHighlight, type TopHighlight } from "./top-highlights";

export async function getTopHighlights(): Promise<TopHighlight[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("match_events")
    .select("id, match_id, event_type, minute, description, player_id, video_url, is_highlight, matches!inner(home_team, away_team, status, match_date)")
    .eq("is_highlight", true).not("video_url", "is", null).eq("matches.status", "finished")
    .or("home_team.ilike.%middelich%,away_team.ilike.%middelich%", { referencedTable: "matches" })
    .order("created_at", { ascending: false }).limit(100);
  if (error) { console.error("Top Highlights konnten nicht geladen werden:", error.message); return []; }
  type Row = { id: string; match_id: string; event_type: string; minute: number; description: string | null; player_id: string | null; video_url: string; is_highlight: boolean; matches: { home_team: string; away_team: string; status: string; match_date: string } };
  const rows = (data as unknown as Row[] ?? []).filter(row => isClubMatch(row.matches) && isTopHighlight(row, row.matches.status)).sort((a,b) => b.matches.match_date.localeCompare(a.matches.match_date) || b.minute - a.minute).slice(0,12);
  const ids = [...new Set(rows.flatMap(row => row.player_id ? [row.player_id] : []))];
  const { data: players } = ids.length ? await supabase.from("players").select("id, first_name, last_name").in("id", ids) : { data: [] };
  return rows.map(row => {
    const player = players?.find(p => p.id === row.player_id);
    return { id: row.id, matchId: row.match_id, videoUrl: row.video_url, minute: row.minute,
      description: row.description || (row.event_type === "goal" ? "⚽ Tor-Moment" : "Top Moment"), opponent: isMiddelichResse(row.matches.home_team) ? row.matches.away_team : row.matches.home_team,
      player: player ? `${player.first_name} ${player.last_name}` : null };
  });
}
