"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || null;
}

export async function saveImprint(formData: FormData) {
  await requireRole(["administrator", "vorstand"]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const clubName = value(formData, "club_name");
  if (!clubName) throw new Error("Der Vereinsname darf nicht leer sein.");

  const { error } = await supabase.from("site_imprint").upsert(
    {
      id: "main",
      club_name: clubName,
      club_legal_name: value(formData, "club_legal_name"),
      street: value(formData, "street"),
      postal_code: value(formData, "postal_code"),
      city: value(formData, "city"),
      phone: value(formData, "phone"),
      email: value(formData, "email"),
      website: value(formData, "website"),
      first_chairman_name: value(formData, "first_chairman_name"),
      second_chairman_name: value(formData, "second_chairman_name"),
      president_name: value(formData, "president_name"),
      content_responsible_name: value(formData, "content_responsible_name"),
      content_responsible_street: value(
        formData,
        "content_responsible_street",
      ),
      content_responsible_postal_code: value(
        formData,
        "content_responsible_postal_code",
      ),
      content_responsible_city: value(
        formData,
        "content_responsible_city",
      ),
      register_court: value(formData, "register_court"),
      register_number: value(formData, "register_number"),
      tax_number: value(formData, "tax_number"),
      additional_information: value(formData, "additional_information"),
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Impressum konnte nicht gespeichert werden: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/impressum");
  revalidatePath("/admin/impressum");
  redirect("/admin/impressum?saved=1");
}
