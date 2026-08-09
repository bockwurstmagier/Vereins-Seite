import { getAvailableSeasons, getPlayerSeasonStats } from "./player-statistics";
import { createClient } from "./supabase/server";
import { isMiddelichResse } from "./club-name";

export type TrainingSessionRow = {
  id: string;
  title: string;
  session_date: string;
  location: string | null;
  focus: string | null;
  intensity: number;
  duration_minutes: number;
  notes: string | null;
};

export type AttendanceStatus =
  | "pending"
  | "present"
  | "late"
  | "excused"
  | "absent"
  | "injured";

export type AttendanceRow = {
  id: string;
  training_session_id: string;
  player_id: string;
  status: AttendanceStatus;
  minutes: number | null;
  note: string | null;
};

export type AvailabilityStatus =
  | "fit"
  | "questionable"
  | "injured"
  | "suspended"
  | "unavailable"
  | "rehab";

export type AvailabilityRow = {
  id: string;
  player_id: string;
  status: AvailabilityStatus;
  reason: string | null;
  start_date: string;
  end_date: string | null;
  note: string | null;
  is_active: boolean;
};

type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  shirt_number: number | null;
  image_url: string | null;
};

export async function getTrainerCockpitData(season?: string) {
  const supabase = await createClient();
  const seasons = await getAvailableSeasons();
  const selectedSeason = season && seasons.includes(season) ? season : seasons[0];

  const [
    stats,
    upcomingResult,
    finishedResult,
    playersResult,
    sessionsResult,
    attendanceResult,
    availabilityResult,
  ] = await Promise.all([
    getPlayerSeasonStats(selectedSeason),
    supabase
      .from("matches")
      .select("id, home_team, away_team, match_date, competition, location, status")
      .eq("status", "scheduled")
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .gte("match_date", new Date().toISOString())
      .order("match_date", { ascending: true })
      .limit(5),
    supabase
      .from("matches")
      .select("id, home_team, away_team, home_score, away_score, match_date")
      .eq("status", "finished")
      .eq("season", selectedSeason)
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .order("match_date", { ascending: false })
      .limit(5),
    supabase
      .from("players")
      .select("id, first_name, last_name, position, shirt_number, image_url")
      .eq("is_active", true)
      .order("last_name", { ascending: true }),
    supabase
      .from("training_sessions")
      .select("id,title,session_date,location,focus,intensity,duration_minutes,notes")
      .order("session_date", { ascending: false })
      .limit(20),
    supabase
      .from("training_attendance")
      .select("id,training_session_id,player_id,status,minutes,note"),
    supabase
      .from("player_availability")
      .select("id,player_id,status,reason,start_date,end_date,note,is_active")
      .eq("is_active", true)
      .order("start_date", { ascending: false }),
  ]);

  const finished = finishedResult.data ?? [];
  const wins = finished.filter((match) => {
    const homeIsClub = isMiddelichResse(match.home_team);
    const ourScore = homeIsClub ? match.home_score ?? 0 : match.away_score ?? 0;
    const opponentScore = homeIsClub ? match.away_score ?? 0 : match.home_score ?? 0;
    return ourScore > opponentScore;
  }).length;
  const draws = finished.filter(
    (match) => (match.home_score ?? 0) === (match.away_score ?? 0),
  ).length;
  const losses = Math.max(0, finished.length - wins - draws);

  const players = (playersResult.data ?? []) as PlayerRow[];
  const sessions = (sessionsResult.data ?? []) as TrainingSessionRow[];
  const attendance = (attendanceResult.data ?? []) as AttendanceRow[];
  const availability = (availabilityResult.data ?? []) as AvailabilityRow[];

  const completedSessionIds = sessions
    .filter((session) => new Date(session.session_date).getTime() <= Date.now())
    .map((session) => session.id);

  const attendanceByPlayer = players.map((player) => {
    const rows = attendance.filter(
      (entry) =>
        entry.player_id === player.id &&
        completedSessionIds.includes(entry.training_session_id),
    );
    const attended = rows.filter((entry) =>
      ["present", "late"].includes(entry.status),
    ).length;
    const counted = rows.filter((entry) => entry.status !== "pending").length;

    return {
      playerId: player.id,
      name: `${player.first_name} ${player.last_name}`,
      attended,
      counted,
      rate: counted ? Math.round((attended / counted) * 100) : 0,
    };
  });

  return {
    seasons,
    selectedSeason,
    stats,
    topScorers: stats
      .slice()
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      .slice(0, 5),
    mostAppearances: stats
      .slice()
      .sort((a, b) => b.appearances - a.appearances || b.minutes - a.minutes)
      .slice(0, 5),
    cardLeaders: stats
      .slice()
      .sort(
        (a, b) =>
          b.yellowCards +
          b.redCards * 3 -
          (a.yellowCards + a.redCards * 3),
      )
      .slice(0, 5),
    upcoming: upcomingResult.data ?? [],
    recent: finished,
    activePlayers: players.length,
    record: { games: finished.length, wins, draws, losses },
    players,
    sessions,
    attendance,
    availability,
    unavailablePlayers: availability.filter((entry) => entry.status !== "fit"),
    attendanceLeaders: attendanceByPlayer
      .slice()
      .sort((a, b) => b.rate - a.rate || b.attended - a.attended)
      .slice(0, 8),
  };
}

export async function getTrainingSessionData(sessionId: string) {
  const supabase = await createClient();

  const [sessionResult, playersResult, attendanceResult] = await Promise.all([
    supabase
      .from("training_sessions")
      .select("id,title,session_date,location,focus,intensity,duration_minutes,notes")
      .eq("id", sessionId)
      .single(),
    supabase
      .from("players")
      .select("id,first_name,last_name,position,shirt_number,image_url")
      .eq("is_active", true)
      .order("last_name", { ascending: true }),
    supabase
      .from("training_attendance")
      .select("id,training_session_id,player_id,status,minutes,note")
      .eq("training_session_id", sessionId),
  ]);

  if (sessionResult.error || !sessionResult.data) return null;

  return {
    session: sessionResult.data as TrainingSessionRow,
    players: (playersResult.data ?? []) as PlayerRow[],
    attendance: (attendanceResult.data ?? []) as AttendanceRow[],
  };
}
