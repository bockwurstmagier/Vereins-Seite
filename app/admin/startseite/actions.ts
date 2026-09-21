"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";
import { HOME_MODULES, normalizeHomeModules } from "../../../lib/home-modules";

export async function saveHomeModules(formData: FormData) {
  await requireRole(["administrator", "vorstand"]);
  const modules = normalizeHomeModules(HOME_MODULES.map(module => ({ id: module.id,
    enabled: formData.get(`${module.id}_enabled`) === "on", order: Number(formData.get(`${module.id}_order`)) })));
  const supabase = await createClient();
  const { error } = await supabase.from("app_settings").upsert({ key: "home_modules", value: modules.map(({ id, enabled, order }) => ({ id, enabled, order })), updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(`Startseite konnte nicht gespeichert werden: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/admin/startseite");
  redirect("/admin/startseite?saved=1");
}
