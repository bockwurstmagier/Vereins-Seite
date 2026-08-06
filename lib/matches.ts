import { supabase } from "./supabase";

export type DatabaseMatch = {
  id: string;
  competition: string;
  matchday: string | null;
  home_team: string;
  away_team: string;
  match_date: string;
  location: string | null;
  maps_query: string | null;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "live" | "finished";
  scorers: string[] | null;
  home_logo_url?: string | null;
  away_logo_url?: string | null;
};

type ClubLogoRow = {
  name: string;
  logo_url: string | null;
  aliases: string[] | null;
};

function normalizeClubName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\b(e\.?\s*v\.?|ev)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findLogo(clubs: ClubLogoRow[], teamName: string) {
  const normalizedTeam = normalizeClubName(teamName);

  const match = clubs.find((club) => {
    const names = [club.name, ...(club.aliases ?? [])];
    return names.some((name) => normalizeClubName(name) === normalizedTeam);
  });

  return match?.logo_url ?? null;
}

export async function getNextMatch(): Promise<DatabaseMatch | null> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, competition, matchday, home_team, away_team, match_date, location, maps_query, home_score, away_score, status, scorers",
    )
    .eq("status", "scheduled")
    .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
    .gte("match_date", new Date().toISOString())
    .order("match_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Fehler beim Laden des nächsten Spiels:", error.message);
    return null;
  }

  if (!data) return null;

  const { data: clubs, error: clubsError } = await supabase
    .from("clubs")
    .select("name, logo_url, aliases");

  if (clubsError) {
    console.error("Vereinslogos konnten nicht geladen werden:", clubsError.message);
  }

  const clubRows = (clubs ?? []) as ClubLogoRow[];

  return {
    ...(data as DatabaseMatch),
    home_logo_url: findLogo(clubRows, data.home_team),
    away_logo_url: findLogo(clubRows, data.away_team),
  };
}
