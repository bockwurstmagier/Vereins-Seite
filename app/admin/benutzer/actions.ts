"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { APP_ROLES, requireRole, type AppRole } from "../../../lib/auth/roles";

export async function updateUserProfile(formData: FormData) {
  await requireRole(["administrator"]);

  const id = String(formData.get("id") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "") as AppRole;
  const isActive = formData.get("is_active") === "on";

  if (!id || !APP_ROLES.includes(role)) {
    throw new Error("Ungültige Benutzerdaten.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({
      display_name: displayName,
      role,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Benutzer konnte nicht aktualisiert werden: ${error.message}`);
  }

  revalidatePath("/admin/benutzer");
  redirect("/admin/benutzer?updated=1");
}
