import type { AppRole } from "./roles";

export type AdminArea =
  | "dashboard"
  | "spiele"
  | "saisonimport"
  | "match_center"
  | "live_admin"
  | "trainer_cockpit"
  | "tabelle"
  | "news"
  | "galerie"
  | "team"
  | "sponsoren"
  | "vereine"
  | "termine"
  | "anfragen"
  | "medien"
  | "text_assistent"
  | "vereinsassistent"
  | "social_studio"
  | "benutzer"
  | "aktivitaeten"
  | "einstellungen";

const permissions: Record<AppRole, AdminArea[]> = {
  administrator: [
    "dashboard",
    "spiele",
    "saisonimport",
    "match_center",
    "live_admin",
    "trainer_cockpit",
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
    "social_studio",
    "benutzer",
    "aktivitaeten",
    "einstellungen",
    "vereinsassistent",
],
  vorstand: [
    "dashboard",
    "spiele",
    "saisonimport",
    "tabelle",
    "news",
    "sponsoren",
    "vereine",
    "termine",
    "anfragen",
    "medien",
    "social_studio",
    "aktivitaeten",
    "vereinsassistent",
],
  trainer: ["dashboard", "spiele", "match_center", "live_admin", "trainer_cockpit", "tabelle", "team", "termine", "vereinsassistent",
],
  social_media: [
    "dashboard",
    "news",
    "galerie",
    "medien",
    "text_assistent",
    "social_studio",
    "vereinsassistent",
],
  betreuer: ["dashboard", "spiele", "match_center", "live_admin", "trainer_cockpit", "team", "termine", "vereinsassistent",
],
};

export function canAccess(role: AppRole, area: AdminArea) {
  return permissions[role].includes(area);
}
