import "server-only";

import { createClient } from "./supabase/server";

const CLUB_MARKER = "middelich-resse";

type FinishedMatch = {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  competition: string;
};

export async function getClubCommandCenterData() {
  const supabase = await createClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sixtyDaysAhead = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const [
    liveMatchResult,
    nextMatchResult,
    recentResultsResult,
    standingsResult,
    activePlayersResult,
    availabilityResult,
    latestTrainingResult,
    upcomingTrainingsResult,
    todayEventsResult,
    upcomingEventsResult,
    messagesResult,
    sponsorsResult,
    playersWithBirthdaysResult,
    pendingResponsesResult,
  ] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id,home_team,away_team,home_score,away_score,match_date,competition,status,current_minute",
      )
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .in("status", ["live", "halftime"])
      .order("match_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("matches")
      .select(
        "id,home_team,away_team,home_score,away_score,match_date,competition,location,status",
      )
      .eq("status", "scheduled")
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .gte("match_date", nowIso)
      .order("match_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("matches")
      .select(
        "id,home_team,away_team,home_score,away_score,match_date,competition",
      )
      .eq("status", "finished")
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .order("match_date", { ascending: false })
      .limit(5),
    supabase
      .from("standings")
      .select(
        "position,team_name,played,wins,draws,losses,goals_for,goals_against,points,is_club,logo_url",
      )
      .order("position", { ascending: true }),
    supabase
      .from("players")
      .select("id,first_name,last_name,squad,position,birth_date,image_url")
      .eq("is_active", true)
      .order("last_name"),
    supabase
      .from("player_availability")
      .select(
        "id,player_id,status,reason,start_date,end_date,note,is_active",
      )
      .eq("is_active", true),
    supabase
      .from("training_sessions")
      .select("id,title,session_date,location")
      .lte("session_date", nowIso)
      .order("session_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("training_sessions")
      .select("id,title,session_date,location,focus")
      .gte("session_date", nowIso)
      .order("session_date", { ascending: true })
      .limit(3),
    supabase
      .from("club_events")
      .select("id,title,event_type,starts_at,location,is_public")
      .gte("starts_at", todayStart.toISOString())
      .lte("starts_at", todayEnd.toISOString())
      .order("starts_at", { ascending: true }),
    supabase
      .from("club_events")
      .select("id,title,event_type,starts_at,location,is_public")
      .gt("starts_at", todayEnd.toISOString())
      .order("starts_at", { ascending: true })
      .limit(5),
    supabase
      .from("player_messages")
      .select("id,title,body,is_important,created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("sponsors")
      .select("id,name,category,end_date,is_active,logo_url")
      .eq("is_active", true)
      .not("end_date", "is", null)
      .gte("end_date", now.toISOString().slice(0, 10))
      .lte("end_date", sixtyDaysAhead.toISOString().slice(0, 10))
      .order("end_date", { ascending: true }),
    supabase
      .from("players")
      .select("id,first_name,last_name,birth_date,image_url,squad")
      .eq("is_active", true)
      .not("birth_date", "is", null),
    supabase
      .from("player_responses")
      .select("id,response,updated_at")
      .eq("response", "maybe")
      .gte("updated_at", sevenDaysAgo.toISOString()),
  ]);

  const latestTraining = latestTrainingResult.data;
  let trainingAttendance: Array<{
    status: string;
    player_id: string;
  }> = [];

  if (latestTraining?.id) {
    const { data } = await supabase
      .from("training_attendance")
      .select("status,player_id")
      .eq("training_session_id", latestTraining.id);

    trainingAttendance = data ?? [];
  }

  const players = activePlayersResult.data ?? [];
  const playerMap = new Map(
    players.map((player) => [
      player.id,
      `${player.first_name} ${player.last_name}`,
    ]),
  );

  const unavailable = (availabilityResult.data ?? []).map((entry) => ({
    ...entry,
    playerName: playerMap.get(entry.player_id) ?? "Spieler",
  }));

  const attendanceRelevant = trainingAttendance.filter(
    (entry) => entry.status !== "pending",
  );
  const attended = attendanceRelevant.filter((entry) =>
    ["present", "late"].includes(entry.status),
  ).length;
  const attendanceRate = attendanceRelevant.length
    ? Math.round((attended / attendanceRelevant.length) * 100)
    : 0;

  const standings = standingsResult.data ?? [];
  const clubStanding =
    standings.find((row) => row.is_club) ??
    standings.find((row) =>
      row.team_name.toLowerCase().includes(CLUB_MARKER),
    ) ??
    null;

  const birthdays = getUpcomingBirthdays(
    playersWithBirthdaysResult.data ?? [],
    now,
    45,
  );

  const recentResults = ((recentResultsResult.data ?? []) as FinishedMatch[]).map(
    (match) => {
      const isHome = match.home_team.toLowerCase().includes(CLUB_MARKER);
      const own = isHome ? match.home_score ?? 0 : match.away_score ?? 0;
      const opponent = isHome ? match.away_score ?? 0 : match.home_score ?? 0;

      return {
        ...match,
        outcome: own > opponent ? "win" : own === opponent ? "draw" : "loss",
      };
    },
  );

  return {
    liveMatch: liveMatchResult.data,
    nextMatch: nextMatchResult.data,
    recentResults,
    standings: standings.slice(0, 8),
    clubStanding,
    activePlayers: players.length,
    unavailable,
    latestTraining,
    attendanceRate,
    attendanceRelevant: attendanceRelevant.length,
    upcomingTrainings: upcomingTrainingsResult.data ?? [],
    todayEvents: todayEventsResult.data ?? [],
    upcomingEvents: upcomingEventsResult.data ?? [],
    messages: messagesResult.data ?? [],
    sponsorsExpiring: sponsorsResult.data ?? [],
    birthdays,
    openTasks:
      unavailable.length +
      (sponsorsResult.data?.length ?? 0) +
      (pendingResponsesResult.data?.length ?? 0),
    pendingResponses: pendingResponsesResult.data?.length ?? 0,
  };
}

function getUpcomingBirthdays<
  T extends {
    id: string;
    first_name: string;
    last_name: string;
    birth_date: string | null;
    image_url: string | null;
    squad: string;
  },
>(players: T[], now: Date, daysAhead: number) {
  return players
    .map((player) => {
      if (!player.birth_date) return null;

      const birthDate = new Date(`${player.birth_date}T12:00:00`);
      const nextBirthday = new Date(
        now.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate(),
        12,
      );

      if (nextBirthday.getTime() < now.getTime()) {
        nextBirthday.setFullYear(now.getFullYear() + 1);
      }

      const daysUntil = Math.ceil(
        (nextBirthday.getTime() - now.getTime()) / 86_400_000,
      );

      if (daysUntil > daysAhead) return null;

      return {
        ...player,
        nextBirthday: nextBirthday.toISOString(),
        daysUntil,
        age: nextBirthday.getFullYear() - birthDate.getFullYear(),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
