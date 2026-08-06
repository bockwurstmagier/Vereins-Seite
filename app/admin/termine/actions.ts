"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function required(formData: FormData, key: string, label: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`Bitte das Feld „${label}“ ausfüllen.`);
  return value;
}

function toIso(date: string, time: string) {
  const value = `${date}T${time}:00`;
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Datum oder Uhrzeit ist ungültig.");
  }

  return parsed.toISOString();
}

async function requireCalendarAccess() {
  await requireRole(["administrator", "vorstand", "trainer"]);
  return createClient();
}

function refreshCalendar(id?: string) {
  revalidatePath("/");
  revalidatePath("/termine");
  revalidatePath("/admin");
  revalidatePath("/admin/termine");
  if (id) revalidatePath(`/admin/termine/${id}`);
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Der Termin konnte nicht gespeichert werden.";
}

export async function createEvent(formData: FormData) {
  const supabase = await requireCalendarAccess();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let failure: string | null = null;

  try {
    const title = required(formData, "title", "Titel");
    const date = required(formData, "date", "Startdatum");
    const allDay = formData.get("all_day") === "on";
    const time = allDay
      ? "00:00"
      : required(formData, "time", "Startzeit");
    const endDate = text(formData, "end_date") || date;
    const endTime = allDay ? "23:59" : text(formData, "end_time");

    const startsAt = toIso(date, time);
    const endsAt = endTime ? toIso(endDate, endTime) : null;

    if (endsAt && new Date(endsAt) < new Date(startsAt)) {
      throw new Error("Das Ende darf nicht vor dem Beginn liegen.");
    }

    const { error } = await supabase.from("club_events").insert({
      title,
      event_type: required(formData, "event_type", "Kategorie"),
      starts_at: startsAt,
      ends_at: endsAt,
      location: text(formData, "location") || null,
      description: text(formData, "description") || null,
      all_day: allDay,
      is_public: formData.get("is_public") === "on",
      created_by: user.id,
    });

    if (error) {
      throw new Error(`Termin konnte nicht gespeichert werden: ${error.message}`);
    }
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) {
    redirect(`/admin/termine?error=${encodeURIComponent(failure)}`);
  }

  refreshCalendar();
  redirect("/admin/termine?created=1");
}

export async function updateEvent(formData: FormData) {
  const supabase = await requireCalendarAccess();
  const id = text(formData, "id");

  if (!id) {
    redirect(
      `/admin/termine?error=${encodeURIComponent(
        "Die Termin-ID fehlt. Bitte den Termin erneut öffnen.",
      )}`,
    );
  }

  let failure: string | null = null;

  try {
    const title = required(formData, "title", "Titel");
    const date = required(formData, "date", "Startdatum");
    const allDay = formData.get("all_day") === "on";
    const time = allDay
      ? "00:00"
      : required(formData, "time", "Startzeit");
    const endDate = text(formData, "end_date") || date;
    const endTime = allDay ? "23:59" : text(formData, "end_time");

    const startsAt = toIso(date, time);
    const endsAt = endTime ? toIso(endDate, endTime) : null;

    if (endsAt && new Date(endsAt) < new Date(startsAt)) {
      throw new Error("Das Ende darf nicht vor dem Beginn liegen.");
    }

    const { error } = await supabase
      .from("club_events")
      .update({
        title,
        event_type: required(formData, "event_type", "Kategorie"),
        starts_at: startsAt,
        ends_at: endsAt,
        location: text(formData, "location") || null,
        description: text(formData, "description") || null,
        all_day: allDay,
        is_public: formData.get("is_public") === "on",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(
        `Termin konnte nicht aktualisiert werden: ${error.message}`,
      );
    }
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) {
    redirect(
      `/admin/termine/${id}?error=${encodeURIComponent(failure)}`,
    );
  }

  refreshCalendar(id);
  redirect("/admin/termine?updated=1");
}

export async function deleteEvent(formData: FormData) {
  const supabase = await requireCalendarAccess();
  const id = text(formData, "id");

  if (!id) {
    redirect(
      `/admin/termine?error=${encodeURIComponent(
        "Die Termin-ID fehlt.",
      )}`,
    );
  }

  const { error } = await supabase.from("club_events").delete().eq("id", id);

  if (error) {
    redirect(
      `/admin/termine?error=${encodeURIComponent(
        `Termin konnte nicht gelöscht werden: ${error.message}`,
      )}`,
    );
  }

  refreshCalendar();
  redirect("/admin/termine?deleted=1");
}
