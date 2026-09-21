export const HOME_MODULES = [
  { id: "matchday", label: "Tippspiel / Matchday-Hub" },
  { id: "birthdays", label: "Geburtstage" },
  { id: "fanpass", label: "Fanpass" },
  { id: "match", label: "Match-Center / Nächstes Ligaspiel" },
  { id: "cup", label: "Pokal" },
  { id: "highlights", label: "Top Highlights" },
  { id: "fussball", label: "Fußball.de-Spielplan" },
  { id: "lastmatch", label: "Letztes Spiel" },
  { id: "voting", label: "Spieler des Spiels" },
  { id: "table", label: "Tabelle" },
  { id: "news", label: "News" },
  { id: "events", label: "Termine" },
  { id: "gallery", label: "Galerie" },
  { id: "team", label: "Mannschaft" },
  { id: "sponsors", label: "Sponsoren" },
  { id: "links", label: "Weitere Vereinsangebote" },
] as const;
export type HomeModuleId = (typeof HOME_MODULES)[number]["id"];
export type HomeModule = { id: HomeModuleId; label: string; enabled: boolean; order: number };

/** Only known module ids and valid values may reach the public page. */
export function normalizeHomeModules(value: unknown): HomeModule[] {
  const rows = Array.isArray(value) ? value : [];
  return HOME_MODULES.map((module, index) => {
    const row = rows.find(r => r && typeof r === "object" && r.id === module.id);
    return { ...module, enabled: typeof row?.enabled === "boolean" ? row.enabled : true,
      order: Number.isInteger(row?.order) && row.order >= 0 && row.order <= 999 ? row.order : index * 10 };
  }).sort((a, b) => a.order - b.order);
}
