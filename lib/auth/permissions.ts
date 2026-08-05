import type { AppRole } from "./roles";

export type AdminArea =
  | "dashboard"
  | "spiele"
  | "match_center"
  | "live_admin"
  | "trainer_cockpit"
  | "tabelle"
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
    "live_admin",
    "trainer_cockpit",
    "tabelle",
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
    "tabelle",
    "news",
    "sponsoren",
    "termine",
    "anfragen",
    "medien",
    "social_studio",
    "aktivitaeten",
  ],
  trainer: ["dashboard", "spiele", "match_center", "live_admin", "trainer_cockpit", "tabelle", "team", "termine"],
  social_media: [
    "dashboard",
    "news",
    "galerie",
    "medien",
    "text_assistent",
    "social_studio",
  ],
  betreuer: ["dashboard", "spiele", "match_center", "live_admin", "trainer_cockpit", "team", "termine"],
};

export function canAccess(role: AppRole, area: AdminArea) {
  return permissions[role].includes(area);
}
