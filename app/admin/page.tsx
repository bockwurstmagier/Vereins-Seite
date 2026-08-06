import PersonalDashboard from "../../components/admin/PersonalDashboard";
import { canAccess, type AdminArea } from "../../lib/auth/permissions";
import { requireActiveProfile, ROLE_LABELS } from "../../lib/auth/roles";
import { createClient } from "../../lib/supabase/server";

type ActivityRow = {
  id: number;
  action: "insert" | "update" | "delete";
  entity_type: string;
  title: string | null;
  created_at: string;
};

export default async function AdminDashboard() {
  const profile = await requireActiveProfile();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [
    matchesCountResult,
    newsCountResult,
    sponsorsCountResult,
    playersCountResult,
    galleryCountResult,
    upcomingMatchResult,
    recentNewsResult,
    upcomingEventsResult,
    activityResult,
    finishedMatchesResult,
  ] = await Promise.all([
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%"),
    supabase.from("news").select("*", { count: "exact", head: true }),
    supabase.from("sponsors").select("*", { count: "exact", head: true }),
    supabase
      .from("players")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("gallery_images")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("matches")
      .select("id,competition,home_team,away_team,match_date,location")
      .eq("status", "scheduled")
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .gte("match_date", now)
      .order("match_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("news")
      .select("id,title,category,status")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("club_events")
      .select("id,title,event_type,starts_at,location,is_public")
      .gte("starts_at", now)
      .order("starts_at", { ascending: true })
      .limit(4),
    supabase
      .from("activity_logs")
      .select("id,action,entity_type,title,created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("matches")
      .select("home_team,away_team,home_score,away_score")
      .eq("status", "finished")
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .not("home_score", "is", null)
      .not("away_score", "is", null),
  ]);

  const allAreas: AdminArea[] = [
    "dashboard",
    "spiele",
    "saisonimport",
    "match_center",
    "live_admin",
    "trainer_cockpit",
    "statistiken",
    "tabelle",
    "news",
    "galerie",
    "team",
    "sponsoren",
    "vereine",
    "termine",
    "anfragen",
    "medien",
    "text_assistent",
    "vereinsassistent",
    "social_studio",
    "grafikstudio",
    "spielerportal",
    "benutzer",
    "aktivitaeten",
    "einstellungen",
  ];

  const displayName =
    profile.display_name || profile.email.split("@")[0] || "Admin";

  return (
    <PersonalDashboard
      data={{
        displayName,
        role: profile.role,
        roleLabel: ROLE_LABELS[profile.role],
        accessibleAreas: allAreas.filter((area) =>
          canAccess(profile.role, area),
        ),
        counts: {
          matches: matchesCountResult.count ?? 0,
          players: playersCountResult.count ?? 0,
          news: newsCountResult.count ?? 0,
          sponsors: sponsorsCountResult.count ?? 0,
          gallery: galleryCountResult.count ?? 0,
        },
        season: calculateSeasonStats(finishedMatchesResult.data ?? []),
        nextMatch: upcomingMatchResult.data,
        recentNews: recentNewsResult.data ?? [],
        upcomingEvents: upcomingEventsResult.data ?? [],
        activities: (activityResult.data ?? []) as ActivityRow[],
      }}
    />
  );
}

function calculateSeasonStats(
  matches: Array<{
    home_team: string;
    away_team: string;
    home_score: number | null;
    away_score: number | null;
  }>,
) {
  const clubName = "middelich-resse";
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const match of matches) {
    if (match.home_score === null || match.away_score === null) continue;
    const isHome = match.home_team.toLowerCase().includes(clubName);
    const own = isHome ? match.home_score : match.away_score;
    const opponent = isHome ? match.away_score : match.home_score;

    goalsFor += own;
    goalsAgainst += opponent;

    if (own > opponent) wins += 1;
    else if (own === opponent) draws += 1;
    else losses += 1;
  }

  const games = wins + draws + losses;

  return {
    games,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    winRate: games ? Math.round((wins / games) * 100) : 0,
  };
}
