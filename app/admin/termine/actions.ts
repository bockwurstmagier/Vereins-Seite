"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function required(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`Das Feld ${key} fehlt.`);
  return value;
}

function toIso(date: string, time: string, allDay: boolean) {
  const value = allDay ? `${date}T00:00:00` : `${date}T${time}:00`;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error("Datum oder Uhrzeit ist ungültig.");
  return parsed.toISOString();
}

async function requireCalendarAccess() {
  await requireRole(["administrator", "vorstand", "trainer"]);
  return createClient();
}

export async function createEvent(formData: FormData) {
  const supabase = await requireCalendarAccess();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = required(formData, "title");
  const date = required(formData, "date");
  const allDay = formData.get("all_day") === "on";
  const time = allDay ? "00:00" : required(formData, "time");
  const endDate = text(formData, "end_date") || date;
  const endTime = allDay ? "23:59" : text(formData, "end_time");

  const startsAt = toIso(date, time, allDay);
  const endsAt = endTime ? toIso(endDate, endTime, false) : null;

  if (endsAt && new Date(endsAt) < new Date(startsAt)) {
    throw new Error("Das Ende darf nicht vor dem Beginn liegen.");
  }

  const { error } = await supabase.from("club_events").insert({
    title,
    event_type: required(formData, "event_type"),
    starts_at: startsAt,
    ends_at: endsAt,
    location: text(formData, "location") || null,
    description: text(formData, "description") || null,
    all_day: allDay,
    is_public: formData.get("is_public") === "on",
    created_by: user.id,
  });

  if (error) throw new Error(`Termin konnte nicht gespeichert werden: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/termine");
  revalidatePath("/admin");
  revalidatePath("/admin/termine");
  redirect("/admin/termine?created=1");
}

export async function updateEvent(formData: FormData) {
  const supabase = await requireCalendarAccess();
  const id = required(formData, "id");
  const title = required(formData, "title");
  const date = required(formData, "date");
  const allDay = formData.get("all_day") === "on";
  const time = allDay ? "00:00" : required(formData, "time");
  const endDate = text(formData, "end_date") || date;
  const endTime = allDay ? "23:59" : text(formData, "end_time");
  const startsAt = toIso(date, time, allDay);
  const endsAt = endTime ? toIso(endDate, endTime, false) : null;

  if (endsAt && new Date(endsAt) < new Date(startsAt)) {
    throw new Error("Das Ende darf nicht vor dem Beginn liegen.");
  }

  const { error } = await supabase
    .from("club_events")
    .update({
      title,
      event_type: required(formData, "event_type"),
      starts_at: startsAt,
      ends_at: endsAt,
      location: text(formData, "location") || null,
      description: text(formData, "description") || null,
      all_day: allDay,
      is_public: formData.get("is_public") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`Termin konnte nicht aktualisiert werden: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/termine");
  revalidatePath("/admin");
  revalidatePath("/admin/termine");
  revalidatePath(`/admin/termine/${id}`);
  redirect("/admin/termine?updated=1");
}

export async function deleteEvent(formData: FormData) {
  const supabase = await requireCalendarAccess();
  const id = required(formData, "id");
  const { error } = await supabase.from("club_events").delete().eq("id", id);
  if (error) throw new Error(`Termin konnte nicht gelöscht werden: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/termine");
  revalidatePath("/admin");
  revalidatePath("/admin/termine");
  redirect("/admin/termine?deleted=1");
}
