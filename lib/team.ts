import { createClient } from "./supabase/server";

export type PublicPlayer = {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
  squad: string;
  shirt_number: number | null;
  position: string;
  strong_foot: string | null;
  height_cm: number | null;
  birth_date: string | null;
  nationality: string | null;
  instagram_url: string | null;
  short_profile: string | null;
  favorite_club: string | null;
  favorite_player: string | null;
  image_url: string | null;
  sort_order: number;
};

export async function getActivePlayers(): Promise<PublicPlayer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select(
      "id, first_name, last_name, slug, squad, shirt_number, position, strong_foot, height_cm, birth_date, nationality, instagram_url, short_profile, favorite_club, favorite_player, image_url, sort_order",
    )
    .eq("is_active", true)
    .order("squad", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Spieler konnten nicht geladen werden:", error);
    return [];
  }

  return data ?? [];
}
