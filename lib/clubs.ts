import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type ClubIdentity = {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  website_url: string | null;
  aliases: string[];
};

export function normalizeClubName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\b(e\.?\s*v\.?|ev)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getClubIdentityMap(
  supabase: SupabaseClient,
  teamNames: string[],
) {
  const uniqueNames = [...new Set(teamNames.filter(Boolean))];
  const result = new Map<string, ClubIdentity>();
  if (!uniqueNames.length) return result;

  const { data, error } = await supabase
    .from("clubs")
    .select(
      "id,name,short_name,logo_url,primary_color,secondary_color,website_url,aliases",
    )
    .order("name", { ascending: true });

  if (error || !data?.length) return result;

  const clubs = data.map((club) => ({
    ...club,
    aliases: Array.isArray(club.aliases) ? club.aliases : [],
  })) as ClubIdentity[];

  const lookup = new Map<string, ClubIdentity>();
  for (const club of clubs) {
    lookup.set(normalizeClubName(club.name), club);
    for (const alias of club.aliases) {
      lookup.set(normalizeClubName(alias), club);
    }
  }

  for (const teamName of uniqueNames) {
    const normalized = normalizeClubName(teamName);
    const exact = lookup.get(normalized);
    if (exact) {
      result.set(teamName, exact);
      continue;
    }

    const partial = clubs.find((club) => {
      const clubName = normalizeClubName(club.name);
      return (
        normalized.startsWith(`${clubName} `) ||
        clubName.startsWith(`${normalized} `)
      );
    });
    if (partial) result.set(teamName, partial);
  }

  return result;
}

export async function ensureClubsFromTeamNames(
  supabase: SupabaseClient,
  teamNames: string[],
) {
  const uniqueNames = [...new Set(teamNames.map((name) => name.trim()).filter(Boolean))];
  if (!uniqueNames.length) return 0;

  const rows = uniqueNames.map((name) => ({
    name,
    normalized_name: normalizeClubName(name),
    aliases: [],
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("clubs")
    .upsert(rows, { onConflict: "normalized_name", ignoreDuplicates: true });

  if (error) {
    throw new Error(`Vereine konnten nicht automatisch angelegt werden: ${error.message}`);
  }

  return rows.length;
}
