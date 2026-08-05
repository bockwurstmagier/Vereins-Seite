import { createClient } from "./supabase/server";

export const EVENT_CATEGORIES = [
  "Spiel",
  "Training",
  "Turnier",
  "Sitzung",
  "Vereinsveranstaltung",
  "Geburtstag",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export type ClubEvent = {
  id: string;
  title: string;
  event_type: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  description: string | null;
  is_public: boolean;
  all_day: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function getCategoryStyles(category: string) {
  switch (category) {
    case "Spiel":
      return "border-red-500/30 bg-red-950/45 text-red-300";
    case "Training":
      return "border-emerald-500/30 bg-emerald-950/35 text-emerald-300";
    case "Turnier":
      return "border-amber-500/30 bg-amber-950/35 text-amber-300";
    case "Sitzung":
      return "border-sky-500/30 bg-sky-950/35 text-sky-300";
    case "Geburtstag":
      return "border-fuchsia-500/30 bg-fuchsia-950/35 text-fuchsia-300";
    default:
      return "border-violet-500/30 bg-violet-950/35 text-violet-300";
  }
}

export function getGoogleCalendarUrl(event: ClubEvent) {
  const format = (value: string) =>
    new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const start = format(event.starts_at);
  const end = format(
    event.ends_at ?? new Date(new Date(event.starts_at).getTime() + 90 * 60_000).toISOString(),
  );

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description ?? "",
    location: event.location ?? "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export async function getPublicEvents(limit = 100): Promise<ClubEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_events")
    .select("*")
    .eq("is_public", true)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Termine konnten nicht geladen werden:", error.message);
    return [];
  }

  return (data ?? []) as ClubEvent[];
}
