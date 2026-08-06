import type { AppRole } from "./roles";

export type AdminArea =
  | "dashboard"
  | "spiele"
  | "saisonimport"
  | "match_center"
  | "live_admin"
  | "trainer_cockpit"
  | "statistiken"
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
  | "grafikstudio"
  | "spielerportal"
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
    "benutzer",
    "aktivitaeten",
    "einstellungen",
      "spielerportal",
],
  vorstand: [
    "dashboard",
    "spiele",
    "saisonimport",
    "statistiken",
    "tabelle",
    "news",
    "sponsoren",
    "vereine",
    "termine",
    "anfragen",
    "medien",
    "vereinsassistent",
    "social_studio",
    "grafikstudio",
    "aktivitaeten",
      "spielerportal",
],
  trainer: [
    "dashboard",
    "spiele",
    "match_center",
    "live_admin",
    "trainer_cockpit",
    "statistiken",
    "tabelle",
    "team",
    "termine",
    "vereinsassistent",
    "grafikstudio",
      "spielerportal",
],
  social_media: [
    "dashboard",
    "news",
    "galerie",
    "medien",
    "text_assistent",
    "vereinsassistent",
    "social_studio",
    "grafikstudio",
  ],
  spieler: [],
  betreuer: [
    "dashboard",
    "spiele",
    "match_center",
    "live_admin",
    "trainer_cockpit",
    "statistiken",
    "team",
    "termine",
    "vereinsassistent",
    "grafikstudio",
      "spielerportal",
],
};

export function canAccess(role: AppRole, area: AdminArea) {
  return permissions[role].includes(area);
}
