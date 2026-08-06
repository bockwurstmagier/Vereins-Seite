import type { AppRole } from "./roles";

export type AdminArea =
  | "dashboard"
  | "vereinszentrale"
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
  | "mediencenter"
  | "autographics"
  | "spielerportal"
  | "benutzer"
  | "aktivitaeten"
  | "einstellungen";

const permissions: Record<AppRole, AdminArea[]> = {
  administrator: [
    "vereinszentrale",
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
    "mediencenter",
    "autographics",
],
  vorstand: [
    "vereinszentrale",
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
    "mediencenter",
    "autographics",
],
  trainer: [
    "vereinszentrale",
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
    "mediencenter",
    "autographics",
],
  social_media: [
    "vereinszentrale",
    "dashboard",
    "news",
    "galerie",
    "medien",
    "text_assistent",
    "vereinsassistent",
    "social_studio",
    "grafikstudio",
      "mediencenter",
    "autographics",
],
  spieler: [],
  betreuer: [
    "vereinszentrale",
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
    "mediencenter",
    "autographics",
],
};

export function canAccess(role: AppRole, area: AdminArea) {
  return permissions[role].includes(area);
}
