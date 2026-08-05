import type { AppRole } from "./roles";

export type AdminArea =
  | "dashboard"
  | "spiele"
  | "match_center"
  | "news"
  | "galerie"
  | "team"
  | "sponsoren"
  | "termine"
  | "anfragen"
  | "medien"
  | "text_assistent"
  | "social_studio"
  | "benutzer"
  | "aktivitaeten"
  | "einstellungen";

const permissions: Record<AppRole, AdminArea[]> = {
  administrator: [
    "dashboard",
    "spiele",
    "match_center",
    "news",
    "galerie",
    "team",
    "sponsoren",
    "termine",
    "anfragen",
    "medien",
    "text_assistent",
    "social_studio",
    "benutzer",
    "aktivitaeten",
    "einstellungen",
  ],
  vorstand: [
    "dashboard",
    "spiele",
    "news",
    "sponsoren",
    "termine",
    "anfragen",
    "medien",
    "social_studio",
    "aktivitaeten",
  ],
  trainer: ["dashboard", "spiele", "match_center", "team", "termine"],
  social_media: [
    "dashboard",
    "news",
    "galerie",
    "medien",
    "text_assistent",
    "social_studio",
  ],
  betreuer: ["dashboard", "spiele", "match_center", "team", "termine"],
};

export function canAccess(role: AppRole, area: AdminArea) {
  return permissions[role].includes(area);
}
