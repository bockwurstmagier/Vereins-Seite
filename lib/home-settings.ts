import "server-only";
import { createAdminClient } from "./supabase/admin";
import { normalizeHomeModules } from "./home-modules";

export async function getHomeModules() {
  try {
    // Existing app_settings is intentionally not readable by anonymous clients.
    const { data, error } = await createAdminClient().from("app_settings").select("value").eq("key", "home_modules").maybeSingle();
    if (error) throw error;
    return normalizeHomeModules(data?.value);
  } catch (error) {
    console.error("Startseiten-Konfiguration nicht verfügbar; Standardmodule werden angezeigt.", error instanceof Error ? error.message : "Datenbankfehler");
    return normalizeHomeModules(null);
  }
}
